import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">🦋</span>
            <span>TaleSoul</span>
          </div>
          <p className="footer-copyright">© 2025 All Rights Reserved</p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
            <a href="/terms">Terms & Conditions</a>
            <a href="/privacy">Privacy</a>
          </div>

          <div className="footer-column">
            <h4>Resources</h4>
            <a href="/blog">Blog</a>
            <a href="/mentors">Find Mentors</a>
            <a href="/courses">Courses</a>
            <a href="/community">Community</a>
          </div>

          <div className="footer-column subscribe">
            <h4>Subscribe</h4>
            <p>Subscribe to stay tuned for new web design and latest updates. Let's do it!</p>
            <div className="subscribe-form">
              <input type="email" placeholder="Enter Your Email" />
              <button className="btn-subscribe">→</button>
            </div>
            <div className="social-links">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">in</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">f</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">t</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
