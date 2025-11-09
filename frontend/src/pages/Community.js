import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Community.css';

const Community = () => {
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchAllPosts();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/api/v1/community/groups');
      setGroups(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch groups');
    }
  };

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/community/posts');
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPosts = async (groupId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/community/posts?group_id=${groupId}`);
      setPosts(response.data);
      setSelectedGroup(groupId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupFilter = (groupId) => {
    if (groupId === selectedGroup) {
      setSelectedGroup(null);
      fetchAllPosts();
    } else {
      fetchGroupPosts(groupId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Community Forum</h1>
        <p>Connect, share, and learn from fellow members</p>
        <Link to="/community/create-post" className="create-post-btn">
          + Create New Post
        </Link>
      </div>

      <div className="community-content">
        <aside className="groups-sidebar">
          <h2>Groups</h2>
          <div className="groups-list">
            <button
              className={`group-item ${selectedGroup === null ? 'active' : ''}`}
              onClick={() => {
                setSelectedGroup(null);
                fetchAllPosts();
              }}
            >
              <span className="group-icon">🌐</span>
              <span>All Posts</span>
            </button>

            {groups.map((group) => (
              <button
                key={group.id}
                className={`group-item ${selectedGroup === group.id ? 'active' : ''}`}
                onClick={() => handleGroupFilter(group.id)}
              >
                <span className="group-icon">👥</span>
                <div className="group-info">
                  <span className="group-name">{group.name}</span>
                  {group.description && (
                    <span className="group-desc">{group.description}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="posts-section">
          {loading ? (
            <div className="loading-spinner">Loading posts...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <h3>No posts yet</h3>
              <p>Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <Link key={post.id} to={`/community/post/${post.id}`} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        {post.author?.profile_picture ? (
                          <img src={post.author.profile_picture} alt={post.author.full_name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {post.author?.full_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="author-info">
                        <span className="author-name">{post.author?.full_name}</span>
                        <span className="post-time">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p>{post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}</p>
                  </div>

                  <div className="post-footer">
                    <span className="post-stat">💬 Discuss</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Community;
