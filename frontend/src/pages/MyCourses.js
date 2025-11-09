import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyCourses.css';

const MyCourses = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration_minutes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyCourses();
  }, [isAuthenticated]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/courses/my-courses');
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
      };

      await api.post('/api/v1/courses/', courseData);

      // Reset form and refresh list
      setFormData({ title: '', description: '', price: '', duration_minutes: '' });
      setShowCreateForm(false);
      fetchMyCourses();

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      await api.patch(`/api/v1/courses/${courseId}`, {
        is_published: !currentStatus
      });
      fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update course');
    }
  };

  const handleUploadVideo = async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/api/v1/courses/${courseId}/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Video uploaded successfully!');
      fetchMyCourses();

    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to upload video');
    }
  };

  const handleUploadThumbnail = async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/api/v1/courses/${courseId}/upload-thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Thumbnail uploaded successfully!');
      fetchMyCourses();

    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to upload thumbnail');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/courses/${courseId}`);
      fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="my-courses-container">
        <div className="loading-spinner">Loading your courses...</div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="my-courses-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-courses-container">
      <div className="courses-header">
        <h1>My Courses</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="create-course-btn">
          {showCreateForm ? 'Cancel' : '+ Create New Course'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-course-form">
          <h2>Create New Course</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleCreateCourse}>
            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter course title"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will learn"
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="29.99"
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="60"
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      <div className="courses-list">
        {courses.length === 0 ? (
          <div className="no-courses">
            <h3>No courses yet</h3>
            <p>Create your first course to start teaching!</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-item">
              <div className="course-thumbnail-preview">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} />
                ) : (
                  <div className="thumbnail-placeholder">No thumbnail</div>
                )}
              </div>

              <div className="course-content">
                <div className="course-main-info">
                  <h3>{course.title}</h3>
                  <p className="course-desc">{course.description}</p>

                  <div className="course-stats">
                    <span className="stat">💰 ${course.price}</span>
                    {course.duration_minutes && (
                      <span className="stat">⏱ {course.duration_minutes} min</span>
                    )}
                    <span className={`status ${course.is_published ? 'published' : 'draft'}`}>
                      {course.is_published ? '✓ Published' : '📝 Draft'}
                    </span>
                  </div>
                </div>

                <div className="course-actions">
                  <div className="upload-section">
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleUploadVideo(course.id, e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      {course.video_url ? '✓ Update Video' : '📹 Upload Video'}
                    </label>

                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadThumbnail(course.id, e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      {course.thumbnail_url ? '✓ Update Thumbnail' : '🖼 Upload Thumbnail'}
                    </label>
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={() => handlePublishToggle(course.id, course.is_published)}
                      className={`btn ${course.is_published ? 'btn-warning' : 'btn-success'}`}
                    >
                      {course.is_published ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyCourses;
