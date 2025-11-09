import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Layout wrapper
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Routes with Layout */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/why-us"
          element={
            <Layout>
              <div className="page-placeholder">
                <h1>Why Us</h1>
                <p>Coming soon...</p>
              </div>
            </Layout>
          }
        />

        <Route
          path="/consultant"
          element={
            <Layout>
              <div className="page-placeholder">
                <h1>Find Consultants</h1>
                <p>Browse our expert mentors and consultants</p>
              </div>
            </Layout>
          }
        />

        <Route
          path="/community"
          element={
            <Layout>
              <div className="page-placeholder">
                <h1>Community</h1>
                <p>Join discussions and connect with others</p>
              </div>
            </Layout>
          }
        />

        <Route
          path="/soul-coin"
          element={
            <Layout>
              <div className="page-placeholder">
                <h1>Soul Coin</h1>
                <p>Coming soon...</p>
              </div>
            </Layout>
          }
        />

        <Route
          path="/blog"
          element={
            <Layout>
              <div className="page-placeholder">
                <h1>Blog</h1>
                <p>Read our latest articles and insights</p>
              </div>
            </Layout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="page-placeholder">
                  <h1>Dashboard</h1>
                  <p>Welcome to your dashboard</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
