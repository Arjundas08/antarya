import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStart = () => {
    navigate('/onboarding');
  };

  return (
    <main className="landing-page">
      {/* ===== HERO BACKGROUND ===== */}
      <div className="landing-hero-bg" />
      
      {/* ===== ADVANCED OVERLAY ===== */}
      <div className="landing-overlay-1" />
      <div className="landing-overlay-2" />
      <div className="landing-overlay-3" />
      
      {/* ===== CONTENT ===== */}
      <div className="landing-content">
        
        {/* NAVBAR */}
        <nav className="landing-nav">
          <div className="landing-logo-group">
            <div className="landing-logo-icon">अ</div>
            <span className="landing-logo-text">ANTARYA</span>
          </div>
          <button className="landing-nav-btn" onClick={handleStart}>
            Connect Your Shop →
          </button>
        </nav>

        {/* HERO BODY */}
        <div className="landing-hero-body">
          
          {/* BADGE */}
          <div className="landing-badge">
            <span className="landing-badge-dot-container">
              <span className="landing-badge-dot-ping"></span>
              <span className="landing-badge-dot"></span>
            </span>
            <span className="landing-badge-text">
              Built for 63 Lakh+ Indian Shops
            </span>
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="landing-headline">
            Dukan Chalao <br />
            <span className="landing-headline-gradient">
              From Your Phone
            </span>
          </h1>

          {/* SUBTITLE */}
          <div className="landing-subtitle-box">
            <p className="landing-subtitle-text">
              <span className="text-emerald-400">Antarya</span> is the 
              <span className="text-white-bold"> digital brain </span>
              for your shop. Scan bills, sell with your voice, and get smart AI suggestions — 
              everything is as easy as WhatsApp.
            </p>
          </div>

          {/* CTA BUTTONS */}
          <div className="landing-cta-group">
            <button className="landing-btn-primary group" onClick={handleStart}>
              <span>🚀 Start For Free</span>
              <div className="landing-btn-primary-shimmer" />
            </button>
            
            <button className="landing-btn-secondary" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
              <span>▶</span> Watch Demo
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="landing-trust-badges">
            <div className="landing-trust-item">
              <div className="landing-trust-value">₹0</div>
              <div className="landing-trust-label">Cost</div>
            </div>
            <div className="landing-trust-divider" />
            <div className="landing-trust-item">
              <div className="landing-trust-value">2 Min</div>
              <div className="landing-trust-label">Setup</div>
            </div>
            <div className="landing-trust-divider" />
            <div className="landing-trust-item">
              <div className="landing-trust-value">100%</div>
              <div className="landing-trust-label">Made in India</div>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="landing-scroll-indicator">
          <div className="landing-scroll-mouse">
            <div className="landing-scroll-wheel" />
          </div>
        </div>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <section className="landing-features-section">
        <div className="landing-features-container">
          
          <div className="landing-features-header">
            <h2>
              How It Makes Your Life <span className="text-emerald-400">Easy</span>
            </h2>
            <p>No excel, no complicated math, no tension. Just simple magic.</p>
          </div>

          <div className="landing-features-grid">
            {/* CARD 1 */}
            <div className="landing-feature-card">
              <div className="landing-feature-icon">📷</div>
              <h3>Scan Your Bills</h3>
              <p>
                Got a handwritten purchase bill? Just take a photo. Antarya reads everything automatically — item names, prices, and quantities.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="landing-feature-card">
              <div className="landing-feature-icon">🎤</div>
              <h3>Sell with your Voice</h3>
              <p>
                Just speak into your phone: "Two Maggi, One Litre Oil". Antarya will find the items, record the sale, and calculate the total instantly.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="landing-feature-card">
              <div className="landing-feature-icon">🧠</div>
              <h3>Smart AI Advice</h3>
              <p>
                Before you run out of cash, Antarya warns you. It auto-tracks low stock and reminds you to collect pending Udhaar from customers!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="landing-final-cta">
        <h2>
          Your Shop, <br />
          <span className="text-emerald-400">Now Smart</span>
        </h2>
        <p>
          Join the smart shopkeepers who use modern technology to grow their business effortlessly.
        </p>
        <button className="landing-btn-final" onClick={handleStart}>
          Get Started Now — It's Free
        </button>
      </section>
    </main>
  );
}
