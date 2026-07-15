/**
 * routes/search.js
 */
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { extractFeatures } = require('../services/imageFeatureExtractor');
const { searchSimilarImages } = require('../services/vectorSearch');
const { loadProducts } = require('../utils/loadProducts');
const User = require('../models/User');
const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/visual', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Read uploaded image
    const imageBuffer = fs.readFileSync(req.file.path);

    // Extract features — pass empty text so the vision model describes the image precisely
    // If vision model fails it falls back to a generic description, not a hardcoded constant
    const features = await extractFeatures(imageBuffer, '');
    if (!features || features.length !== 768) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Failed to extract image features' });
    }

    // Search similar images in Pinecone
    const results = await searchSimilarImages(features, 10);
    const productIds = results.map(r => r.metadata.product_id);

    // Fetch product metadata from CSV
    const products = await loadProducts();
    const productMap = new Map(products.map(p => [p.product_id, p]));

    // Preserve Pinecone's ranked order (best match first)
    const matchedProducts = productIds
      .map(id => productMap.get(id))
      .filter(Boolean);

    // Update user search history
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(userId, {
          $push: { search_history: { product_id: productIds[0], timestamp: new Date() } }
        });
      } catch (authErr) {
        // Don't fail the search if auth update fails
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(matchedProducts.map(product => {
      const match = results.find(r => r.metadata.product_id === product.product_id);
      const dist = match ? match.score : 1;
      return {
        ...product,
        similarity: 1 / (1 + Math.max(0, dist))
      };
    }));
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Search failed: ' + err.message });
  }
});


router.get('/recommendations', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json([]);
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId);
    const productIds = user.search_history.map(h => h.product_id).slice(0, 5);
    
    // Fetch product metadata from CSV
    const products = await loadProducts();
    const matchedProducts = products.filter(p => productIds.includes(p.product_id));
    
    res.json(matchedProducts);
  } catch (err) {
    res.status(500).json({ error: 'Recommendation failed: ' + err.message });
  }
});

module.exports = router;