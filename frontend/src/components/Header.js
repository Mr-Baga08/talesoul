import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">🦋</div>
          <span className="logo-text">TaleSoul</span>
        </Link>

        <nav className="nav-menu">
          <Link to="/why-us" className="nav-link">Why Us</Link>
          <Link to="/consultant" className="nav-link">Consultant</Link>
          <Link to="/community" className="nav-link">Community</Link>
          <Link to="/soul-coin" className="nav-link">Soul Coin</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <div className="user-menu">
                <span className="user-name">{user?.full_name}</span>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
