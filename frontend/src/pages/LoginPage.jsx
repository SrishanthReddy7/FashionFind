import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://fashionfind-backend.onrender.com';
      const res = await axios.post(
        `${API_URL}/api/auth/signin`,
        { email, password }
      );
      setToken(res.data.token);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT PANEL (42% Deep Purple Gradient) */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel__glow"></div>

        <div className="auth-panel__content">
          <Link to="/" className="auth-logo">
            <span>✦</span> FashionFind
          </Link>

          <h2 className="auth-panel__tagline">Welcome Back</h2>
          <p className="auth-panel__sub">
            Your style journey continues here. Sign in to access your personalized fashion dashboard.
          </p>

          <ul className="auth-panel__features">
            {[
              ['🔍', 'Visual Image Search', 'Upload photos to find similar items.'],
              ['🤖', 'AI Recommendations', 'Personalized fashion suggestions.'],
              ['✨', 'Smart Dashboard', 'Trending and curated collections.'],
            ].map(([icon, title, desc]) => (
              <li key={title} className="auth-panel__feature">
                <span className="auth-panel__feature-icon">{icon}</span>
                <div className="auth-panel__feature-text">
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-panel__bottom-image">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
            alt="Fashion lookbook"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80'; }}
          />
        </div>
      </div>

      {/* RIGHT PANEL (58% Light Background) */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-card">
          <Link to="/" className="auth-pill-back">
            ← Back to Home
          </Link>

          <div className="auth-form-card__header">
            <h1 className="auth-form-card__title">Sign in to your account</h1>
            <p className="auth-form-card__sub">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign Up →
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="ff-form-group">
              <label className="ff-label" htmlFor="login-email">Email Address</label>
              <div className="ff-input-wrap">
                <span className="ff-input-icon">✉</span>
                <input
                  id="login-email"
                  type="email"
                  className="ff-input ff-input--icon"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="ff-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="ff-label" htmlFor="login-password">Password</label>
                <button type="button" className="auth-forgot">Forgot Password?</button>
              </div>
              <div className="ff-input-wrap">
                <span className="ff-input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="ff-input ff-input--icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="ff-pwd-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner"></span> : 'Sign In'}
            </button>
          </form>

          <div className="auth-form-card__footer">
            By signing in, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
