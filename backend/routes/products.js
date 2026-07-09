/**
 * routes/products.js
 */
const express = require('express');
const { loadProducts } = require('../utils/loadProducts');
const router = express.Router();

router.get('/', async (req, res) => {
  const { sort, year } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 24;

  try {
    const products = await loadProducts();

    // Apply filters
    let filteredProducts = products;
    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      filteredProducts = products.filter(p => p.launch_on >= start && p.launch_on <= end);
    }

    // Apply sorting
    if (sort === 'price-low') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'discount') {
      filteredProducts.sort((a, b) => b.discount - a.discount);
    }

    const totalCount = filteredProducts.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);

    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.setHeader('X-Total-Count', totalCount);
    res.json(paginatedProducts);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const products = await loadProducts();
    const trending = products
      .filter(p => p.launch_on >= new Date('2025-01-01') && p.launch_on <= new Date('2025-12-31'))
      .sort((a, b) => b.launch_on - a.launch_on)
      .slice(0, 10);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: 'Trending fetch failed: ' + err.message });
  }
});

module.exports = router;