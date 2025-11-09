import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyBookings.css';

const MyBookings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.delete(`/api/bookings/${bookingId}`);
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="my-bookings-container">
        <div className="loading-spinner">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bookings-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage your mentor sessions</p>
      </div>

      <div className="filter-section">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({bookings.length})
        </button>
        <button
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          Pending ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          className={filter === 'confirmed' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
        </button>
        <button
          className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('completed')}
        >
          Completed ({bookings.filter(b => b.status === 'completed').length})
        </button>
        <button
          className={filter === 'cancelled' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <h3>No bookings found</h3>
          <p>Start by browsing our mentors and booking a session!</p>
          <button onClick={() => navigate('/mentors')} className="browse-btn">
            Browse Mentors
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-date">
                  <span className="date-icon">📅</span>
                  <span>{formatDate(booking.scheduled_at)}</span>
                </div>
                <span className={`booking-status ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{booking.duration_minutes} minutes</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">${booking.price.toFixed(2)}</span>
                </div>
                {booking.payment_id && (
                  <div className="detail-row">
                    <span className="detail-label">Payment ID:</span>
                    <span className="detail-value">{booking.payment_id}</span>
                  </div>
                )}
                {booking.meeting_link && (
                  <div className="detail-row">
                    <span className="detail-label">Meeting Link:</span>
                    <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" className="meeting-link">
                      Join Meeting
                    </a>
                  </div>
                )}
                {booking.notes && (
                  <div className="detail-row notes">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{booking.notes}</span>
                  </div>
                )}
              </div>

              <div className="booking-actions">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="cancel-btn"
                  >
                    Cancel Booking
                  </button>
                )}
                {booking.status === 'confirmed' && booking.meeting_link && (
                  <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" className="join-btn">
                    Join Meeting
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
