import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { getImageUrl } from '../utils/getImageUrl';
import './ComponentStyles.css';

const VisualSearch = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { token } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const outfitIdeas = [
    {
      title: 'Casual Day Out',
      desc: 'Comfortable and effortless everyday look.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Street Style',
      desc: 'Trendy and bold look for city adventures.',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Chic Look',
      desc: 'Elegant and minimal for a polished vibe.',
      image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Summer Vibes',
      desc: 'Light, fresh and perfect for sunny days.',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults([]);
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  const handleSearch = async () => {
    if (!file) return alert('Please upload an image');
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/search/visual`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      alert('Search failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comp-section">
      <div className="section-heading">
        <div className="section-heading__tag">🔍 AI Visual Search</div>
        <h2 className="section-heading__title">Find Similar Fashion Items</h2>
        <p className="section-heading__sub">Upload any fashion photo and let AI find visually similar products for you.</p>
      </div>

      <div className="vs-layout">
        {/* ================= SECTION 1: TOP HERO AREA (TWO-COLUMN LAYOUT) ================= */}
        <div className="vs-split-container">
          {/* LEFT COLUMN: UPLOAD IMAGE, PREVIEW & BUTTONS */}
          <div className="vs-left-col">
            <div className="vs-upload">
              <div
                id="vs-dropzone"
                className={`vs-dropzone ${dragging ? 'vs-dropzone--dragging' : ''} ${preview ? 'vs-dropzone--has-preview' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="vs-dropzone__preview" />
                    <div className="vs-dropzone__overlay">
                      <span>Click to change image</span>
                    </div>
                  </>
                ) : (
                  <div className="vs-dropzone__placeholder">
                    <div className="vs-dropzone__icon">📸</div>
                    <p className="vs-dropzone__title">Drop your fashion image here</p>
                    <p className="vs-dropzone__sub">or click to browse files</p>
                    <div className="vs-dropzone__formats">JPG, PNG, WEBP supported</div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  id="vs-search-btn"
                  className="btn btn-primary btn-full"
                  onClick={handleSearch}
                  disabled={!file || loading}
                  style={{ borderRadius: 'var(--radius-md)', padding: '14px' }}
                >
                  {loading ? (
                    <><span style={{ animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }}>⟳</span> Searching...</>
                  ) : '🔍 Search Similar'}
                </button>
                {preview && (
                  <button
                    className="btn btn-outline"
                    style={{ borderRadius: 'var(--radius-md)', padding: '14px 20px' }}
                    onClick={() => { setFile(null); setPreview(null); setResults([]); }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STYLE IT YOUR WAY PANEL */}
          <div className="vs-right-col">
            <div className="vs-inspiration-panel">
              <div className="vs-inspiration-header">
                <div className="vs-inspiration-title-text">✨ Style It Your Way</div>
                <div className="vs-inspiration-subtitle">Outfit ideas with similar items</div>
              </div>

              <div className="vs-inspiration-grid">
                {outfitIdeas.map((outfit, index) => (
                  <div key={index} className="vs-inspiration-card">
                    <div className="vs-inspiration-img-wrap">
                      <img
                        src={outfit.image}
                        alt={outfit.title}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'; }}
                      />
                    </div>
                    <div className="vs-card-title">{outfit.title}</div>
                    <div className="vs-card-desc">{outfit.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: FULL-WIDTH SIMILAR PRODUCTS GRID ================= */}
        {results.length > 0 && (
          <div className="vs-results vs-results--fullwidth">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)' }}>
                ✨ {results.length} Similar Products Found
              </h3>
            </div>
            <div className="products-grid products-grid--fullwidth">
              {results.map(product => (
                <div key={product.product_id} className="product-card">
                  <div className="product-card__image-wrap">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80'; }}
                    />
                    <span className="product-card__badge">Match</span>
                    <button className="product-card__heart">❤</button>
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__brand">{product.brand}</div>
                    <div className="product-card__name">{product.name}</div>
                    <div className="product-card__price-row">
                      <span className="product-card__price">₹{product.price}</span>
                      <span className="product-card__similarity">{(product.similarity * 100).toFixed(0)}% match</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!results.length && !loading && file && (
          <div className="vs-empty vs-empty--fullwidth">
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔎</div>
            <p style={{ color: 'var(--text-muted)' }}>Click "Search Similar" to find matching products</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualSearch;