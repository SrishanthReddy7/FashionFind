import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroFashionImg from '../assets/images/hero-fashion.png';
import './Landing.css';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = ['Home', 'Features', 'How It Works', 'Categories', 'About', 'Contact'];

  const features = [
    { icon: '🔍', title: 'Visual Search', desc: 'Upload any fashion photo and instantly find visually similar products from our curated catalog.' },
    { icon: '🤖', title: 'AI Recommendations', desc: 'Our AI engine learns your style preferences and delivers hyper-personalized outfit suggestions.' },
    { icon: '👗', title: 'Wide Collection', desc: 'Browse thousands of fashion products across jeans, dresses, accessories, and more.' },
    { icon: '🔒', title: 'Secure Platform', desc: 'JWT-powered authentication ensures your account and search history stays private and safe.' },
  ];

  const stats = [
    { value: '500+', label: 'Happy Customers' },
    { value: '2K+', label: 'Products Available' },
    { value: '500+', label: 'Top Brands' },
    { value: '99.9%', label: 'Secure Platform' },
  ];

  const steps = [
    { num: '01', icon: '📸', title: 'Upload Image', desc: 'Take a photo or upload an image of any fashion item you like.' },
    { num: '02', icon: '🧠', title: 'AI Searches', desc: 'Our AI extracts visual features and searches thousands of products instantly.' },
    { num: '03', icon: '✨', title: 'Discover Fashion', desc: 'Browse perfectly matched results and save your favorites.' },
  ];

  return (
    <div className="landing">

      {/* ======= NAVBAR ======= */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-nav__inner">
          <Link to="/" className="landing-nav__logo">
            <span className="landing-nav__logo-icon">✦</span>
            FashionFind
          </Link>

          <ul className={`landing-nav__links ${mobileOpen ? 'landing-nav__links--open' : ''}`}>
            {navLinks.map(link => (
              <li key={link}>
                <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="landing-nav__link"
                  onClick={() => setMobileOpen(false)}>
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <div className="landing-nav__actions">
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>

          <button className="landing-nav__hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* ======= HERO ======= */}
      <section className="hero" id="home">
        <div className="hero__bg-blobs">
          <div className="hero__blob hero__blob--1"></div>
          <div className="hero__blob hero__blob--2"></div>
          <div className="hero__blob hero__blob--3"></div>
        </div>

        <div className="hero__inner">
          <div className="hero__left">
            <div className="badge badge-purple hero__eyebrow">
              <span>✦</span> AI-Powered Fashion Search
            </div>

            <h1 className="hero__title">
              Find Your <span className="gradient-text">Perfect Style,</span>
              <br />Your Way
            </h1>

            <p className="hero__sub">
              FashionFind helps you discover visually similar fashion products using
              AI-powered image search and personalized recommendations.
            </p>

            <ul className="hero__checklist">
              {['Visual Image Search', 'AI Recommendations', 'Smart Product Discovery', 'Secure Authentication'].map(f => (
                <li key={f}><span className="hero__check">✓</span>{f}</li>
              ))}
            </ul>

            <div className="hero__buttons">
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started →</Link>
              <a href="#features" className="btn btn-outline btn-lg">Explore Features</a>
            </div>
          </div>

          <div className="hero__right">
            <img
              src={heroFashionImg}
              alt="AI Fashion Visual Search"
              className="hero__image"
            />
          </div>
        </div>
      </section>

      {/* ======= FEATURES CARDS ======= */}
      <section className="lsec" id="features">
        <div className="lsec__inner">
          <div className="section-heading" style={{ textAlign: 'center' }}>
            <div className="section-heading__tag">✦ What We Offer</div>
            <h2 className="section-heading__title">Everything You Need to <span className="gradient-text">Find Fashion</span></h2>
            <p className="section-heading__sub">Powerful features that make discovering your perfect style effortless.</p>
          </div>

          <div className="feature-cards">
            {features.map((f, i) => (
              <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= STATS STRIP ======= */}
      <section className="stats-strip">
        <div className="stats-strip__inner">
          {stats.map((s, i) => (
            <div key={i} className="stats-strip__item">
              <div className="stats-strip__val">{s.value}</div>
              <div className="stats-strip__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ======= FEATURES ALTERNATING ======= */}
      <section className="lsec" id="how-it-works">
        <div className="lsec__inner">
          <div className="section-heading" style={{ textAlign: 'center' }}>
            <div className="section-heading__tag">✦ Platform Features</div>
            <h2 className="section-heading__title">Discover Fashion Like <span className="gradient-text">Never Before</span></h2>
          </div>

          <div className="alt-feature alt-feature--even">
            <div className="alt-feature__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1609234656432-603c35b0ae82?auto=format&fit=crop&w=600&q=80"
                alt="Visual Search"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=80'; }}
              />
            </div>
            <div className="alt-feature__content">
              <div className="section-heading__tag">🔍 Visual Search</div>
              <h3>Search with Images, Not Words</h3>
              <p>Simply upload a photo of any clothing item — a screenshot, a photo you took, or even a magazine cutout — and our AI instantly finds visually similar products in our catalog.</p>
              <Link to="/signup" className="btn btn-primary" style={{ marginTop: '20px' }}>Try It Now →</Link>
            </div>
          </div>

          <div className="alt-feature">
            <div className="alt-feature__content">
              <div className="section-heading__tag">🤖 AI Recommendations</div>
              <h3>Your Personal Style AI</h3>
              <p>Every search you make trains your personal fashion model. The more you use FashionFind, the smarter your recommendations become — tailored entirely to your unique taste.</p>
              <Link to="/signup" className="btn btn-primary" style={{ marginTop: '20px' }}>Get Recommendations →</Link>
            </div>
            <div className="alt-feature__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80"
                alt="AI Recommendations"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=80'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======= HOW IT WORKS ======= */}
      <section className="hiw" id="categories">
        <div className="hiw__inner">
          <div className="section-heading" style={{ textAlign: 'center' }}>
            <div className="section-heading__tag">✦ How It Works</div>
            <h2 className="section-heading__title">Three Steps to Your <span className="gradient-text">Perfect Look</span></h2>
            <p className="section-heading__sub">Getting started is effortless. Your perfect style is just 3 steps away.</p>
          </div>

          <div className="hiw__steps">
            {steps.map((s, i) => (
              <div key={i} className="hiw__step">
                {i < steps.length - 1 && <div className="hiw__connector"></div>}
                <div className="hiw__step-num">{s.num}</div>
                <div className="hiw__step-icon">{s.icon}</div>
                <h3 className="hiw__step-title">{s.title}</h3>
                <p className="hiw__step-desc">{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">Start Discovering →</Link>
          </div>
        </div>
      </section>

      {/* ======= CTA BANNER ======= */}
      <section className="cta-banner" id="about">
        <div className="cta-banner__inner">
          <div className="cta-banner__text">
            <h2>Ready to Find Your <span className="gradient-text">Perfect Style?</span></h2>
            <p>Join thousands of fashion lovers who use FashionFind to discover their next favourite outfit.</p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/signup" className="btn btn-primary btn-lg">Create Free Account</Link>
            <Link to="/login" className="btn btn-white btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="footer" id="contact">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <span>✦</span> FashionFind
            </div>
            <p className="footer__brand-sub">AI-Powered Fashion Visual Search Platform. Discover your perfect style, effortlessly.</p>
            <div className="footer__socials">
              {['𝕏', '📘', '📷', '▶'].map((s, i) => (
                <a key={i} href="#" className="footer__social">{s}</a>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h4>Quick Links</h4>
            {['Home', 'Features', 'How It Works', 'Categories'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}>{l}</a>
            ))}
          </div>

          <div className="footer__col">
            <h4>Account</h4>
            {[['Sign Up', '/signup'], ['Login', '/login']].map(([l, h]) => (
              <Link key={l} to={h}>{l}</Link>
            ))}
          </div>

          <div className="footer__newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest fashion trends delivered to your inbox.</p>
            <div className="footer__newsletter-form">
              <input type="email" placeholder="your@email.com" className="ff-input" style={{ borderRadius: 'var(--radius-full)', padding: '12px 18px' }} />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 FashionFind. All rights reserved.</p>
          <p>Built for Fashion lovers</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
