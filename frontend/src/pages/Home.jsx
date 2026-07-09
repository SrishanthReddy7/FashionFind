import React, { useContext, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import ProductList from '../components/ProductList.jsx';
import VisualSearch from '../components/VisualSearch.jsx';
import Trending from '../components/Trending.jsx';
import Recommended from '../components/Recommended.jsx';
import './Home.css';

const Home = () => {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) return <Navigate to="/login" />;

  const navItems = [
    { id: 'search',      icon: '🔍', label: 'Visual Search' },
    { id: 'recommended', icon: '✨', label: 'For You'        },
    { id: 'browse',      icon: '👗', label: 'Browse Products' },
    { id: 'trending',    icon: '🔥', label: 'Trending'        },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* ======= SIDEBAR ======= */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar__inner">
          <Link to="/" className="dash-sidebar__logo">
            <span>✦</span> FashionFind
          </Link>

          <nav className="dash-sidebar__nav">
            <p className="dash-sidebar__nav-label">Navigation</p>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`dash-sidebar__nav-item ${activeSection === item.id ? 'dash-sidebar__nav-item--active' : ''}`}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              >
                <span className="dash-sidebar__nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {activeSection === item.id && <span className="dash-sidebar__nav-dot"></span>}
              </button>
            ))}
          </nav>

          <div className="dash-sidebar__footer">
            <div className="dash-sidebar__user">
              <div className="dash-sidebar__avatar">
                {user?.email?.[0]?.toUpperCase() || 'F'}
              </div>
              <div className="dash-sidebar__user-info">
                <div className="dash-sidebar__user-name">My Account</div>
                <div className="dash-sidebar__user-email">
                  {user?.email?.slice(0, 20) || 'User'}
                </div>
              </div>
            </div>
            <button className="dash-sidebar__logout" onClick={handleLogout}>
              ↩ Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ======= MAIN CONTENT ======= */}
      <main className="dash-main">
        {/* TOP BAR */}
        <header className="dash-topbar">
          <button className="dash-topbar__hamburger" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="dash-topbar__title">
            {navItems.find(n => n.id === activeSection)?.icon}{' '}
            {navItems.find(n => n.id === activeSection)?.label}
          </div>
          <div className="dash-topbar__right">
            <div className="dash-topbar__avatar">
              {user?.email?.[0]?.toUpperCase() || 'F'}
            </div>
          </div>
        </header>

        {/* HERO BANNER */}
        <section className="dash-hero">
          <div className="dash-hero__inner">
            <div className="dash-hero__text">
              <p className="dash-hero__eyebrow">✦ AI-Powered Platform</p>
              <h1 className="dash-hero__title">
                Find Your Perfect <span className="gradient-text">Style</span>
              </h1>
              <p className="dash-hero__sub">
                Upload an image or browse our curated collection of 2,000+ fashion products.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setActiveSection('search')}>
                  🔍 Visual Search
                </button>
                <button className="btn btn-ghost" onClick={() => setActiveSection('browse')}>
                  Browse All
                </button>
              </div>
            </div>
            <div className="dash-hero__stats">
              {[['2K+','Products'],['500+','Brands'],['AI','Powered'],['99%','Accuracy']].map(([v,l]) => (
                <div key={l} className="dash-hero__stat">
                  <div className="dash-hero__stat-val">{v}</div>
                  <div className="dash-hero__stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="dash-hero__blobs">
            <div className="dash-hero__blob dash-hero__blob--1"></div>
            <div className="dash-hero__blob dash-hero__blob--2"></div>
          </div>
        </section>

        {/* CONTENT SECTIONS */}
        <div className="dash-content">
          <section className={`dash-section ${activeSection === 'search' ? 'dash-section--visible' : ''}`}>
            <VisualSearch />
          </section>
          <section className={`dash-section ${activeSection === 'recommended' ? 'dash-section--visible' : ''}`}>
            <Recommended />
          </section>
          <section className={`dash-section ${activeSection === 'browse' ? 'dash-section--visible' : ''}`}>
            <ProductList />
          </section>
          <section className={`dash-section ${activeSection === 'trending' ? 'dash-section--visible' : ''}`}>
            <Trending />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;