import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/courses/');
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading-spinner">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1>Explore Our Courses</h1>
        <p>Learn from industry experts at your own pace</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>No courses found matching your search.</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-thumbnail">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <span>📚</span>
                  </div>
                )}
              </div>

              <div className="course-info">
                <h3>{course.title}</h3>
                <p className="course-instructor">
                  By {course.instructor?.full_name}
                </p>
                <p className="course-description">{course.description}</p>

                <div className="course-meta">
                  {course.duration_minutes && (
                    <span className="duration">⏱ {course.duration_minutes} min</span>
                  )}
                </div>

                <div className="course-footer">
                  <span className="course-price">${course.price}</span>
                  <Link to={`/course/${course.id}`} className="view-course-btn">
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
