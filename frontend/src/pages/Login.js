import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-section">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">🦋</span>
              <span className="logo-text">TaleSoul</span>
            </div>
          </div>

          <div className="login-content">
            <h1>Welcome Back 👋</h1>
            <p className="login-subtitle">
              We're glad you're here. Step back into your safe space — to feel, reflect, and grow at your pace.
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your number"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <div className="signup-link">
                Don't you have an account? <Link to="/signup">Sign up</Link>
              </div>

              <div className="or-divider">
                <span>© 2025 All right reserved</span>
              </div>
            </form>
          </div>
        </div>

        <div className="login-image-section">
          <div className="butterfly-container">
            <div className="quote-box">
              <p>"You belong here. Exactly as you are. Let's begin, together."</p>
            </div>
            <div className="butterfly-illustration">
              <div className="butterfly">🦋</div>
              <div className="flower">🌸</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
