/**
 * services/vectorSearch.js
 */
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = process.env.PINECONE_INDEX || 'fashionai';
const index = pinecone.Index(indexName);

async function searchSimilarImages(features, topK = 5) {
  try {
    const queryResponse = await index.query({
      vector: features,
      topK,
      includeMetadata: true
    });
    return queryResponse.matches;
  } catch (err) {
    console.error('Vector search error:', err.message);
    throw err;
  }
}

module.exports = { searchSimilarImages };