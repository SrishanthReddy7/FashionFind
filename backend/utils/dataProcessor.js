/**
 * utils/dataProcessor.js
 */
require('dotenv').config();

// Ensure reliable DNS resolution for MongoDB Atlas SRV records across all network providers
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {}

const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { extractFeatures } = require('../services/imageFeatureExtractor');
const { initPinecone } = require('./initPinecone');

function parsePrice(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val);
  const match = str.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

function parseFeatures(row) {
  if (row.feature_list) {
    try {
      let clean = String(row.feature_list).replace(/^\[|\]$/g, '');
      return clean.split(/', '\s*|", "\s*/).map(s => s.replace(/^['"]|['"]$/g, '').replace(/\\xa0/g, ' ').trim()).filter(Boolean);
    } catch (e) { }
  }
  if (row.meta_info) {
    return String(row.meta_info).split('.').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function parseDate(val) {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function readCSVRows(absolutePath) {
  const rows = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(absolutePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

async function processCSV(filePath, options = {}) {
  console.log('Starting CSV processing at:', new Date().toISOString());

  // Validate environment variables
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!process.env.PINECONE_API_KEY || !geminiKey) {
    console.error('Error: Missing PINECONE_API_KEY or GEMINI_API_KEY/GOOGLE_API_KEY in .env');
    process.exit(1);
  }

  // Connect to MongoDB
  console.log("Connecting to MongoDB...");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected to ${mongoose.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }

  // Initialize Pinecone
  console.log('Initializing Pinecone client...');
  const index = await initPinecone();
  const indexName = process.env.PINECONE_INDEX || 'fashionai';
  console.log(`Pinecone index ready: ${indexName}`);

  // Resolve files to process
  let csvFiles = [];
  if (filePath && fs.existsSync(path.resolve(filePath))) {
    const resolved = path.resolve(filePath);
    if (fs.statSync(resolved).isDirectory()) {
      csvFiles = fs.readdirSync(resolved)
        .filter(f => f.endsWith('.csv'))
        .map(f => path.join(resolved, f));
    } else {
      csvFiles = [resolved];
    }
  } else {
    const defaultDir = path.resolve(__dirname, '../data');
    if (fs.existsSync(defaultDir)) {
      csvFiles = fs.readdirSync(defaultDir)
        .filter(f => f.endsWith('.csv'))
        .map(f => path.join(defaultDir, f));
    }
  }

  if (csvFiles.length === 0) {
    console.error('Error: No CSV files found to process.');
    process.exit(1);
  }

  console.log(`Reading CSV files:\n  ${csvFiles.join('\n  ')}`);

  let allRows = [];
  for (const file of csvFiles) {
    const rows = await readCSVRows(file);
    console.log(`Read ${rows.length} rows from ${path.basename(file)}`);
    allRows.push(...rows);
  }

  const limit = options.limit ? parseInt(options.limit, 10) : null;
  const skipIndexed = options.skipIndexed || false;

  // If skip-indexed, fetch all IDs already in Pinecone
  let existingIds = new Set();
  if (skipIndexed) {
    console.log('Fetching already-indexed IDs from Pinecone...');
    try {
      const stats = await index.describeIndexStats();
      const totalVectors = stats.totalRecordCount || 0;
      console.log(`Pinecone already has ${totalVectors} vectors. Will skip those products.`);
      // List IDs in batches using listPaginated
      let paginationToken;
      do {
        const listResult = await index.listPaginated({ limit: 100, paginationToken });
        for (const vec of (listResult.vectors || [])) {
          existingIds.add(vec.id);
        }
        paginationToken = listResult.pagination?.next;
      } while (paginationToken);
      console.log(`Loaded ${existingIds.size} existing IDs to skip.`);
    } catch (err) {
      console.warn('Could not fetch existing IDs, proceeding without skip:', err.message);
    }
  }

  const targetRows = limit && !isNaN(limit) ? allRows.slice(0, limit) : allRows;
  console.log(`Processing ${targetRows.length} total rows...`);

  const products = [];
  const processedIds = new Set();
  let rowCount = 0;
  let upsertedCount = 0;
  let skippedCount = 0;
  let vectorBatch = [];
  const BATCH_SIZE = 50;

  for (const row of targetRows) {
    rowCount++;
    const productId = row.product_id || row.sku;
    const productName = row.product_name;

    console.log(`Processing row ${rowCount}/${targetRows.length}: ${productId || 'unknown'}`);
    try {
      if (!productId || !productName) {
        console.warn(`Skipping row ${rowCount}: Missing product_id/sku or product_name`);
        skippedCount++;
        continue;
      }

      const strId = String(productId);
      if (processedIds.has(strId)) {
        continue;
      }
      processedIds.add(strId);

      // Parse product data and collect for MongoDB upsert
      const price = parsePrice(row.selling_price);
      const discount = parsePrice(row.discount);
      const featuresList = parseFeatures(row);

      products.push({
        product_id: strId,
        name: productName,
        price: price,
        discount: discount,
        category_id: parseInt(row.category_id, 10) || 0,
        brand: row.brand || 'Unknown',
        launch_on: parseDate(row.launch_on),
        image: row.feature_image_s3 || '',
        description: row.description || '',
        features: featuresList
      });

      // Skip Pinecone embedding if already indexed
      if (skipIndexed && existingIds.has(strId)) {
        skippedCount++;
        continue;
      }

      // Check if image file exists locally
      let imageBuffer = null;
      if (row.feature_image_s3) {
        const imagePath = path.resolve(row.feature_image_s3);
        const altPath = path.resolve(__dirname, '../', row.feature_image_s3);
        if (fs.existsSync(imagePath)) {
          imageBuffer = fs.readFileSync(imagePath);
        } else if (fs.existsSync(altPath)) {
          imageBuffer = fs.readFileSync(altPath);
        }
      }

      // Build rich semantic text for embedding
      const metaInfo = String(row.meta_info || '').trim();
      const featureText = featuresList.slice(0, 5).join('. ');
      const styleAttrs = String(row.style_attributes || '').replace(/[{}'"]/g, '').trim();
      const textDescription = [
        productName,
        row.brand ? `Brand: ${row.brand}` : '',
        row.description || '',
        metaInfo,
        featureText,
        styleAttrs
      ].filter(Boolean).join('. ').replace(/\.{2,}/g, '.').trim();
      let features = null;
      let retries = 3;
      while (retries--) {
        try {
          features = await extractFeatures(imageBuffer, textDescription);
          if (features && features.length === 768) break;
        } catch (err) {
          console.warn(`Attempt failed for ${strId}: ${err.message}`);
          if (retries === 0) throw err;
          // Parse retry wait from API error message, e.g. "retry in 38.6s"
          const waitMatch = err.message.match(/retry in (\d+\.?\d*)s/i);
          const waitSecs = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) + 2 : 5;
          console.log(`Rate limit hit. Waiting ${waitSecs}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitSecs * 1000));
        }
      }

      if (!features || features.length !== 768) {
        console.warn(`Skipping row ${rowCount}: Invalid embedding for ${strId}`);
        skippedCount++;
        continue;
      }

      vectorBatch.push({
        id: strId,
        values: features,
        metadata: {
          product_id: strId,
          product_name: String(productName).slice(0, 500),
          brand: String(row.brand || 'Unknown'),
          category_id: String(row.category_id || ''),
          description: String(row.description || '').slice(0, 200)
        }
      });

      // Flush batch if needed
      if (vectorBatch.length >= BATCH_SIZE) {
        await index.upsert(vectorBatch);
        upsertedCount += vectorBatch.length;
        console.log(`Upserted batch of ${vectorBatch.length} vectors (Total: ${upsertedCount})`);
        vectorBatch = [];
      }
    } catch (err) {
      console.error(`Error processing row ${rowCount} (${row.product_id || row.sku}): ${err.message}`);
      skippedCount++;
    }
  }

  // Flush remaining vectorBatch
  if (vectorBatch.length > 0) {
    for (let i = 0; i < 3; i++) {
      try {
        await index.upsert(vectorBatch);
        break;
      } catch (e) {
        if (i === 2) throw e;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    upsertedCount += vectorBatch.length;
    console.log(`Upserted final batch of ${vectorBatch.length} vectors (Total: ${upsertedCount})`);
    vectorBatch = [];
  }

  // Upsert into MongoDB without deleting existing products
  try {
    console.log(`Upserting ${products.length} unique products into MongoDB...`);
    if (products.length > 0) {
      let mongoUpserted = 0;
      const MONGO_BATCH_SIZE = 1000;
      for (let i = 0; i < products.length; i += MONGO_BATCH_SIZE) {
        const batch = products.slice(i, i + MONGO_BATCH_SIZE);
        const operations = batch.map(p => ({
          updateOne: {
            filter: { product_id: p.product_id },
            update: { $set: p },
            upsert: true
          }
        }));
        await Product.bulkWrite(operations, { ordered: false });
        mongoUpserted += batch.length;
      }
      console.log(`Upserted/Updated ${mongoUpserted} products in MongoDB`);
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total rows read/processed: ${rowCount}`);
    console.log(`Total unique products upserted to Pinecone: ${upsertedCount}`);
    console.log(`Total rows skipped: ${skippedCount}`);

    try {
      console.log('Verifying Pinecone data...');
      const stats = await index.describeIndexStats();
      console.log('Pinecone index stats:', JSON.stringify(stats, null, 2));
    } catch (statErr) {
      console.warn('Could not retrieve index stats:', statErr.message);
    }

    console.log('Data processing complete:', new Date().toISOString());
  } catch (err) {
    console.error(`Error finalizing processing: ${err.message}`);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  const filePath = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
  const limitArgIdx = process.argv.indexOf('--limit');
  const limit = limitArgIdx !== -1 ? process.argv[limitArgIdx + 1] : null;
  const skipIndexed = process.argv.includes('--skip-indexed');

  processCSV(filePath, { limit, skipIndexed }).catch(err => {
    console.error('Processing failed:', err.message);
    process.exit(1);
  });
}

module.exports = { processCSV };