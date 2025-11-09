import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    if (isAuthenticated) {
      checkEnrollment();
    }
  }, [courseId, isAuthenticated]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/courses/${courseId}`);
      setCourse(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch course details');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await api.get('/api/v1/courses/my-enrollments');
      const userEnrollment = response.data.find(e => e.course_id === parseInt(courseId));
      setEnrollment(userEnrollment);
    } catch (err) {
      // User not enrolled or error fetching enrollments
      console.log('Not enrolled or error:', err);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setPurchasing(true);

    try {
      // Create payment intent
      const paymentResponse = await api.post('/api/v1/payments/create-payment-intent', {
        course_id: parseInt(courseId)
      });

      // In a real implementation, you would integrate with Stripe Elements here
      // For now, we'll simulate a successful payment
      alert(`Payment intent created: ${paymentResponse.data.client_secret}`);

      // Confirm payment (in real app, this would happen after Stripe confirms)
      await api.post('/api/v1/payments/confirm-payment', {
        payment_intent_id: paymentResponse.data.payment_intent_id,
        course_id: parseInt(courseId)
      });

      alert('Course purchased successfully!');
      window.location.reload(); // Reload to show enrolled status

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to purchase course');
    } finally {
      setPurchasing(false);
    }
  };

  const updateProgress = async (progress) => {
    if (!enrollment) return;

    try {
      await api.patch(`/api/v1/courses/enrollments/${enrollment.id}/progress?progress_percentage=${progress}`);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  if (loading) {
    return <div className="course-detail-container"><div className="loading-spinner">Loading...</div></div>;
  }

  if (error && !course) {
    return <div className="course-detail-container"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="course-detail-container">
      {enrollment ? (
        <div className="enrolled-course">
          <div className="video-section">
            <VideoPlayer
              videoUrl={course.video_url}
              onProgress={updateProgress}
            />
          </div>

          <div className="progress-section">
            <h3>Your Progress</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${enrollment.progress_percentage}%` }}
              />
            </div>
            <p>{enrollment.progress_percentage.toFixed(0)}% Complete</p>
          </div>
        </div>
      ) : null}

      <div className="course-info-section">
        <div className="course-header">
          {course.thumbnail_url && (
            <img src={course.thumbnail_url} alt={course.title} className="course-banner" />
          )}

          <div className="course-title-section">
            <h1>{course.title}</h1>
            <p className="instructor-info">
              Taught by <strong>{course.instructor?.full_name}</strong>
            </p>
          </div>
        </div>

        <div className="course-details">
          <div className="course-description">
            <h2>About This Course</h2>
            <p>{course.description}</p>
          </div>

          <div className="course-metadata">
            {course.duration_minutes && (
              <div className="meta-item">
                <span className="meta-label">Duration:</span>
                <span className="meta-value">{course.duration_minutes} minutes</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Price:</span>
              <span className="meta-value">${course.price}</span>
            </div>
          </div>

          {!enrollment && (
            <div className="purchase-section">
              {error && <div className="error-message">{error}</div>}

              <button
                onClick={handlePurchase}
                className="purchase-btn"
                disabled={purchasing || !isAuthenticated}
              >
                {purchasing
                  ? 'Processing...'
                  : isAuthenticated
                  ? `Enroll Now - $${course.price}`
                  : 'Login to Enroll'
                }
              </button>

              {!isAuthenticated && (
                <p className="auth-notice">Please log in to enroll in this course</p>
              )}
            </div>
          )}

          {enrollment && (
            <div className="enrollment-info">
              <p className="enrolled-badge">✓ You are enrolled in this course</p>
              <p>Enrolled on: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
