import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import './AuthPages.css';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // Signup with name, email, and password
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        { name, email, password }
      );
      // Auto-login after signup
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signin`,
        { email, password }
      );
      setToken(res.data.token);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed. Please try again.');
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

          <h2 className="auth-panel__tagline">Join FashionFind</h2>
          <p className="auth-panel__sub">
            Create your free account and start discovering fashion using AI-powered visual search.
          </p>

          <ul className="auth-panel__features">
            {[
              ['🔍', 'Visual Image Search', 'Upload photos to find similar items.'],
              ['🤖', 'AI Recommendations', 'Personalized fashion suggestions.'],
              ['❤️', 'Save Favourites', 'Wishlist your favourite products.'],
              ['🔒', 'Secure Account', 'JWT secured authentication.'],
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
            src="https://images.unsplash.com/photo-1519657337289-077653f724ed?auto=format&fit=crop&w=800&q=80"
            alt="Fashion discovery"
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
            <h1 className="auth-form-card__title">Create your account</h1>
            <p className="auth-form-card__sub">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In →
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="ff-form-group">
              <label className="ff-label" htmlFor="signup-name">Full Name</label>
              <div className="ff-input-wrap">
                <span className="ff-input-icon">👤</span>
                <input
                  id="signup-name"
                  type="text"
                  className="ff-input ff-input--icon"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="ff-form-group">
              <label className="ff-label" htmlFor="signup-email">Email Address</label>
              <div className="ff-input-wrap">
                <span className="ff-input-icon">✉</span>
                <input
                  id="signup-email"
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
              <label className="ff-label" htmlFor="signup-password">Password</label>
              <div className="ff-input-wrap">
                <span className="ff-input-icon">🔒</span>
                <input
                  id="signup-password"
                  type={showPwd ? 'text' : 'password'}
                  className="ff-input ff-input--icon"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            <div className="ff-form-group">
              <label className="ff-label" htmlFor="signup-confirm">Confirm Password</label>
              <div className="ff-input-wrap">
                <span className="ff-input-icon">🔒</span>
                <input
                  id="signup-confirm"
                  type={showPwd ? 'text' : 'password'}
                  className="ff-input ff-input--icon"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              id="signup-submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner"></span> : 'Create Account'}
            </button>
          </form>

          <div className="auth-form-card__footer">
            By signing up, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
