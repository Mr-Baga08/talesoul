import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check API health
    fetch('/api/v1/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API health check failed:', err);
        setApiStatus({ status: 'error', message: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to TaleSoul</h1>
        <p className="tagline">Your Mentorship & Learning Platform</p>

        <div className="status-card">
          <h2>System Status</h2>
          {loading ? (
            <p>Checking API status...</p>
          ) : (
            <div>
              <p>API Status: <span className={apiStatus?.status === 'ok' ? 'status-ok' : 'status-error'}>
                {apiStatus?.status || 'Unknown'}
              </span></p>
              {apiStatus?.service && <p>Service: {apiStatus.service}</p>}
              {apiStatus?.version && <p>Version: {apiStatus.version}</p>}
            </div>
          )}
        </div>

        <div className="features">
          <h2>Platform Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Mentor Booking</h3>
              <p>Connect with experienced mentors and book 1-on-1 sessions</p>
            </div>
            <div className="feature-card">
              <h3>Course Marketplace</h3>
              <p>Browse and enroll in courses created by industry experts</p>
            </div>
            <div className="feature-card">
              <h3>Community Forum</h3>
              <p>Join discussions, share knowledge, and grow together</p>
            </div>
            <div className="feature-card">
              <h3>Admin Dashboard</h3>
              <p>Comprehensive tools for platform management</p>
            </div>
          </div>
        </div>

        <div className="api-info">
          <h2>API Documentation</h2>
          <p>Access the interactive API documentation at: <a href="/docs" target="_blank" rel="noopener noreferrer">/docs</a></p>
        </div>

        <div className="next-steps">
          <h2>Next Steps</h2>
          <ol>
            <li>Build your React components for authentication, booking, courses, and community</li>
            <li>Integrate with the backend API endpoints</li>
            <li>Add payment integration (Stripe/Razorpay)</li>
            <li>Implement real-time features if needed (WebSockets)</li>
            <li>Deploy to your server and scale as needed</li>
          </ol>
        </div>
      </header>
    </div>
  );
}

export default App;
