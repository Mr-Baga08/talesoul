import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './MentorDetail.css';

const MentorDetail = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking form state
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchMentorDetails();
  }, [mentorId]);

  const fetchMentorDetails = async () => {
    try {
      setLoading(true);

      // Fetch mentor profile
      const mentorResponse = await api.get(`/api/bookings/mentors`);
      const mentorData = mentorResponse.data.find(m => m.user.id === parseInt(mentorId));

      if (!mentorData) {
        setError('Mentor not found');
        return;
      }

      setMentor(mentorData);

      // Fetch availability
      const availResponse = await api.get(`/api/bookings/availability/${mentorData.id}`);
      setAvailability(availResponse.data);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch mentor details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);

      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const bookingData = {
        mentor_id: parseInt(mentorId),
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        notes: notes
      };

      await api.post('/api/bookings/book', bookingData);

      setBookingSuccess(true);

      // Redirect to bookings page after success
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatePrice = () => {
    if (!mentor) return 0;
    return (mentor.hourly_rate * (duration / 60)).toFixed(2);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return <div className="mentor-detail-container"><div className="loading-spinner">Loading...</div></div>;
  }

  if (error && !mentor) {
    return <div className="mentor-detail-container"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="mentor-detail-container">
      {bookingSuccess && (
        <div className="success-banner">
          Booking created successfully! Redirecting to your bookings...
        </div>
      )}

      <div className="mentor-profile-section">
        <div className="profile-header">
          <div className="profile-avatar">
            {mentor.user?.profile_picture ? (
              <img src={mentor.user.profile_picture} alt={mentor.user.full_name} />
            ) : (
              <div className="avatar-placeholder-large">
                {mentor.user?.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1>{mentor.user?.full_name}</h1>
            <p className="expertise">{mentor.expertise}</p>
            <p className="experience">{mentor.years_of_experience} years of experience</p>

            <div className="profile-links">
              {mentor.linkedin_url && (
                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                  LinkedIn
                </a>
              )}
              {mentor.github_url && (
                <a href={mentor.github_url} target="_blank" rel="noopener noreferrer" className="social-link">
                  GitHub
                </a>
              )}
            </div>
          </div>

          <div className="profile-rate">
            <div className="rate-box">
              <span className="rate-amount">${mentor.hourly_rate}</span>
              <span className="rate-period">/hour</span>
            </div>
          </div>
        </div>

        <div className="profile-bio">
          <h2>About</h2>
          <p>{mentor.bio}</p>
        </div>

        <div className="availability-section">
          <h2>Availability</h2>
          {availability.length === 0 ? (
            <p className="no-availability">No availability slots set yet.</p>
          ) : (
            <div className="availability-grid">
              {availability.map((slot) => (
                <div key={slot.id} className="availability-slot">
                  <span className="day">{daysOfWeek[slot.day_of_week]}</span>
                  <span className="time">{slot.start_time} - {slot.end_time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="booking-section">
        <h2>Book a Session</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleBooking} className="booking-form">
          <div className="form-group">
            <label htmlFor="date">Select Date *</label>
            <input
              type="date"
              id="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Select Time *</label>
            <input
              type="time"
              id="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration *</label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              required
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What would you like to discuss?"
              rows={4}
            />
          </div>

          <div className="booking-summary">
            <div className="summary-row">
              <span>Duration:</span>
              <span>{duration} minutes</span>
            </div>
            <div className="summary-row">
              <span>Rate:</span>
              <span>${mentor.hourly_rate}/hour</span>
            </div>
            <div className="summary-row total">
              <span>Total Price:</span>
              <span>${calculatePrice()}</span>
            </div>
          </div>

          <button
            type="submit"
            className="submit-booking-btn"
            disabled={submitting || !isAuthenticated}
          >
            {submitting ? 'Processing...' : isAuthenticated ? 'Proceed to Payment' : 'Login to Book'}
          </button>

          {!isAuthenticated && (
            <p className="auth-notice">Please log in to book a session</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default MentorDetail;
