/**
 * utils/loadProducts.js
 */
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

let productsCache = null;

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
    } catch (e) {}
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

async function readCSVFile(filePath) {
  const products = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const productId = row.product_id || row.sku;
        if (!productId) return;
        products.push({
          product_id: String(productId),
          name: row.product_name || 'Unnamed Product',
          price: parsePrice(row.selling_price),
          discount: parsePrice(row.discount),
          category_id: parseInt(row.category_id, 10) || 0,
          brand: row.brand || 'Unknown',
          launch_on: parseDate(row.launch_on),
          image: row.feature_image_s3 || '',
          description: row.description || '',
          features: parseFeatures(row),
          pdp_url: row.pdp_url || ''
        });
      })
      .on('end', () => resolve(products))
      .on('error', (err) => reject(err));
  });
}

async function loadProducts(forceRefresh = false) {
  if (productsCache && !forceRefresh) return productsCache;

  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    return [];
  }

  const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  const allProductsMap = new Map();

  for (const file of csvFiles) {
    try {
      const filePath = path.join(dataDir, file);
      const fileProducts = await readCSVFile(filePath);
      for (const p of fileProducts) {
        if (!allProductsMap.has(p.product_id)) {
          allProductsMap.set(p.product_id, p);
        }
      }
    } catch (err) {
      console.error(`Error loading CSV file ${file}:`, err.message);
    }
  }

  productsCache = Array.from(allProductsMap.values());
  return productsCache;
}

function clearProductsCache() {
  productsCache = null;
}

module.exports = { loadProducts, clearProductsCache };