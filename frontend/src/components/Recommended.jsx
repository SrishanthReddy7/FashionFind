import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../utils/getImageUrl';
import './ComponentStyles.css';

const Recommended = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { token }               = useContext(AuthContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search/recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRecommendations();
  }, [token]);

  if (!loading && !products.length) return (
    <div className="comp-section">
      <div className="section-heading">
        <div className="section-heading__tag">✨ Personalized For You</div>
        <h2 className="section-heading__title">Recommendations</h2>
      </div>
      <div className="comp-empty">
        <div className="comp-empty__icon">✨</div>
        <h3>No recommendations yet</h3>
        <p>Use Visual Search to find products — your recommendations will appear here based on your search history.</p>
      </div>
    </div>
  );

  return (
    <div className="comp-section">
      <div className="section-heading">
        <div className="section-heading__tag">✨ Personalized For You</div>
        <h2 className="section-heading__title">Recommended for You</h2>
        <p className="section-heading__sub">Based on your search history and style preferences.</p>
      </div>

      {loading ? (
        <div className="products-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="product-card">
              <div className="skeleton" style={{ height: '280px' }}></div>
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
                <span className="product-card__badge">For You</span>
                <button className="product-card__heart">❤</button>
              </div>
              <div className="product-card__body">
                <div className="product-card__brand">{product.brand}</div>
                <div className="product-card__name">{product.name}</div>
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

export default Recommended;