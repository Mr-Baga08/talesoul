import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Mentors from './pages/Mentors';
import MentorDetail from './pages/MentorDetail';
import MyBookings from './pages/MyBookings';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
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
              <Mentors />
            </Layout>
          }
        />

        <Route
          path="/mentors"
          element={
            <Layout>
              <Mentors />
            </Layout>
          }
        />

        <Route
          path="/mentor/:mentorId"
          element={
            <Layout>
              <MentorDetail />
            </Layout>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <MyBookings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <Layout>
              <Courses />
            </Layout>
          }
        />

        <Route
          path="/course/:courseId"
          element={
            <Layout>
              <CourseDetail />
            </Layout>
          }
        />

        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <Layout>
                <MyCourses />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <Layout>
              <Community />
            </Layout>
          }
        />

        <Route
          path="/community/post/:postId"
          element={
            <Layout>
              <PostDetail />
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
