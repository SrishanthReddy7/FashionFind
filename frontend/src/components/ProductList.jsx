import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';
import './ComponentStyles.css';

const ProductList = () => {
  const [products, setProducts]   = useState([]);
  const [sort, setSort]           = useState('');
  const [year, setYear]           = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const limit = 24;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
          params: { sort, year, page, limit }
        });
        setProducts(res.data);
        const totalCount = parseInt(res.headers['x-total-count'] || '0', 10);
        setTotalPages(totalCount > 0 ? Math.ceil(totalCount / limit) : 1);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sort, year, page]);

  const handleSortChange = (e) => { setSort(e.target.value); setPage(1); };
  const handleYearChange = (e) => { setYear(e.target.value); setPage(1); };

  return (
    <div className="comp-section">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div className="section-heading__tag">👗 Collection</div>
          <h2 className="section-heading__title">Browse Products</h2>
          <p className="section-heading__sub">Explore our curated fashion collection.</p>
        </div>

        {/* FILTERS */}
        <div className="pl-filters">
          <div className="pl-filter-group">
            <label className="pl-filter-label">Sort by</label>
            <select className="pl-select" onChange={handleSortChange} value={sort} id="sort-select">
              <option value="">Default</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="discount">Most Discount</option>
            </select>
          </div>
          <div className="pl-filter-group">
            <label className="pl-filter-label">Year</label>
            <select className="pl-select" onChange={handleYearChange} value={year} id="year-select">
              <option value="">All Years</option>
              <option value="2020">2020</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="products-grid">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="product-card">
              <div className="skeleton" style={{ height: '260px' }}></div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ height: '10px', width: '60%' }}></div>
                <div className="skeleton" style={{ height: '14px', width: '90%' }}></div>
                <div className="skeleton" style={{ height: '12px', width: '45%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.product_id} className="product-card">
              <div className="product-card__image-wrap">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80'; }}
                />
                {product.discount > 0 && (
                  <span className="product-card__badge">{product.discount}% off</span>
                )}
                <button className="product-card__heart">❤</button>
              </div>
              <div className="product-card__body">
                <div className="product-card__brand">{product.brand}</div>
                <div className="product-card__name" title={product.name}>{product.name}</div>
                <div className="product-card__price-row">
                  <span className="product-card__price">₹{product.price}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                    {new Date(product.launch_on).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pl-pagination">
          <button
            id="prev-page"
            className="pl-page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>

          <div className="pl-page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  className={`pl-page-num ${page === p ? 'pl-page-num--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            id="next-page"
            className="pl-page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;