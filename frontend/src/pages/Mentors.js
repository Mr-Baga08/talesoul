import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Mentors.css';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bookings/mentors');
      setMentors(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mentors-container">
        <div className="loading-spinner">Loading mentors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentors-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="mentors-container">
      <div className="mentors-header">
        <h1>Find Your Perfect Mentor</h1>
        <p>Connect with experienced professionals to guide your journey</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by name or expertise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="mentors-grid">
        {filteredMentors.length === 0 ? (
          <div className="no-mentors">
            <p>No mentors found matching your search.</p>
          </div>
        ) : (
          filteredMentors.map((mentor) => (
            <div key={mentor.id} className="mentor-card">
              <div className="mentor-avatar">
                {mentor.user?.profile_picture ? (
                  <img src={mentor.user.profile_picture} alt={mentor.user.full_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {mentor.user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mentor-info">
                <h3>{mentor.user?.full_name}</h3>
                <p className="mentor-expertise">{mentor.expertise}</p>
                <p className="mentor-experience">
                  {mentor.years_of_experience} years of experience
                </p>
                <p className="mentor-bio">{mentor.bio}</p>

                <div className="mentor-rate">
                  <span className="rate-label">Hourly Rate:</span>
                  <span className="rate-value">${mentor.hourly_rate}</span>
                </div>

                <div className="mentor-links">
                  {mentor.linkedin_url && (
                    <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {mentor.github_url && (
                    <a href={mentor.github_url} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                </div>

                <Link to={`/mentor/${mentor.user.id}`} className="book-button">
                  View Profile & Book
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Mentors;
