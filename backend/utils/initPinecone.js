/**
 * utils/initPinecone.js
 */
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function initPinecone() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const indexName = process.env.PINECONE_INDEX || 'fashionai';
  const expectedDimension = 768; // For Google's text-embedding-004
  const expectedMetric = 'cosine'; // Cosine is best for text/image semantic embeddings

  try {
    // Fetch existing indexes
    const indexList = await pinecone.listIndexes();
    const indexes = Array.isArray(indexList) ? indexList : indexList.indexes || [];

    // Check for incorrect index
    const wrongIndex = indexes.find(index => index.name === 'fashion-images-1');
    if (wrongIndex) {
      console.log('Deleting incorrect index fashion-images-1...');
      await pinecone.deleteIndex('fashion-images-1');
    }

    // Helper to wait for index readiness
    const waitForIndexReady = async () => {
      for (let i = 0; i < 30; i++) {
        try {
          const desc = await pinecone.describeIndex(indexName);
          if (desc.status?.ready) break;
        } catch (e) { }
        await new Promise(r => setTimeout(r, 2000));
      }
    };

    // Check if correct index exists
    const existingIndex = indexes.find(index => index.name === indexName);
    if (existingIndex) {
      const indexDescription = await pinecone.describeIndex(indexName);
      if (indexDescription.dimension !== expectedDimension || indexDescription.metric !== expectedMetric) {
        console.log(`Index metric: ${indexDescription.metric}, expected: ${expectedMetric}`);
        console.log(`Deleting index ${indexName} with dimension ${indexDescription.dimension}...`);
        await pinecone.deleteIndex(indexName);
        console.log(`Waiting for deletion of ${indexName}...`);
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 3000));
          const list = await pinecone.listIndexes();
          const curr = Array.isArray(list) ? list : list.indexes || [];
          if (!curr.find(idx => idx.name === indexName)) break;
        }

        console.log(`Creating new index ${indexName} with dimension ${expectedDimension}...`);
        await pinecone.createIndex({
          name: indexName,
          dimension: expectedDimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        console.log('Waiting for index to become ready...');
        await waitForIndexReady();
        console.log('Pinecone index recreated with correct dimension');
      }
    } else {
      console.log(`Creating index ${indexName}...`);
      await pinecone.createIndex({
        name: indexName,
        dimension: expectedDimension,
        metric: 'euclidean',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log('Waiting for index to become ready...');
      await waitForIndexReady();
      console.log('Pinecone index created');
    }

    return pinecone.Index(indexName);
  } catch (err) {
    console.error('Pinecone initialization error:', err.message);
    throw err;
  }
}

module.exports = { initPinecone };