import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1>A Platform for Emotional Expression & Inner Healing</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icons">
                  <span className="stat-icon">👤</span>
                  <span className="stat-icon">👤</span>
                  <span className="stat-icon">👤</span>
                </div>
                <span>30+ Soul Users</span>
              </div>
            </div>
            <Link to="/community" className="btn btn-hero">
              Join Our Community
            </Link>
          </div>

          <div className="hero-images">
            <div className="image-grid">
              <div className="image-card">🕯️</div>
              <div className="image-card">🔮</div>
              <div className="image-card">💃</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Long-term mentorship isn't just better – it's faster</h2>
          <p className="section-subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</p>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <h3>1. Find A Mentor</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="feature-arrow">- - - - -</div>

            <div className="feature-item">
              <div className="feature-icon">🤝</div>
              <h3>2. Connect With Mentor</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="feature-arrow">- - - - -</div>

            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <h3>3. Learn From Mentor</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="feature-arrow">- - - - -</div>

            <div className="feature-item">
              <div className="feature-icon">🌱</div>
              <h3>4. Grow Together</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mentors-section">
        <div className="container">
          <h2>Explore 1,400+ Available Mentors</h2>
          <p className="section-subtitle">Experts from every niche use Topmate to build trust, grow revenue, and stay booked.</p>

          <div className="mentors-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mentor-card">
                <div className="mentor-badge">4.8 ⭐</div>
                <div className="mentor-avatar">👤</div>
                <h3>Jorme Bell</h3>
                <p>Software Engineer</p>
                <span className="mentor-tag">Business Development</span>
              </div>
            ))}
          </div>

          <Link to="/consultant" className="btn btn-outline">
            See All Mentor
          </Link>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of learners connecting with expert mentors</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/be-a-mentor" className="btn btn-outline">Become a Mentor</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
