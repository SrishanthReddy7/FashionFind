import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';
import './ComponentStyles.css';

const Trending = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/trending`);
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching trending products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="comp-section">
      <div className="section-heading">
        <div className="section-heading__tag">🔥 Hot Right Now</div>
        <h2 className="section-heading__title">Trending Products</h2>
        <p className="section-heading__sub">The most popular fashion picks of 2025.</p>
      </div>

      {loading ? (
        <div className="products-grid">
          {Array(6).fill(0).map((_, i) => (
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
      ) : products.length === 0 ? (
        <div className="comp-empty">
          <div className="comp-empty__icon">🔥</div>
          <h3>No trending products yet</h3>
          <p>Check back soon for the hottest fashion picks.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product, i) => (
            <div key={product.product_id} className="product-card">
              <div className="product-card__image-wrap">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80'; }}
                />
                <span className="product-card__badge" style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)' }}>
                  #{i + 1} Trending
                </span>
                <button className="product-card__heart">❤</button>
              </div>
              <div className="product-card__body">
                <div className="product-card__brand">{product.brand}</div>
                <div className="product-card__name" title={product.name}>{product.name}</div>
                <div className="product-card__price-row">
                  <span className="product-card__price">₹{product.price}</span>
                  {product.discount > 0 && (
                    <span className="product-card__discount">{product.discount}% off</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trending;