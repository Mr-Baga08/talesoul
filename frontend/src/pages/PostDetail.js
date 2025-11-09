import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchReplies();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/api/v1/community/posts/${postId}`);
      setPost(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch post');
    }
  };

  const fetchReplies = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/community/posts/${postId}/replies`);
      setReplies(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch replies');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!replyContent.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/api/v1/community/replies', {
        post_id: parseInt(postId),
        content: replyContent
      });

      setReplyContent('');
      fetchReplies(); // Refresh replies
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post reply');
    } finally {
      setSubmitting(false);
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

  if (loading && !post) {
    return (
      <div className="post-detail-container">
        <div className="loading-spinner">Loading post...</div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="post-detail-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <button onClick={() => navigate('/community')} className="back-btn">
        ← Back to Community
      </button>

      <div className="post-detail">
        <div className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <div className="author-info">
              <div className="author-avatar">
                {post.author?.profile_picture ? (
                  <img src={post.author.profile_picture} alt={post.author.full_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {post.author?.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="author-name">{post.author?.full_name}</div>
                <div className="post-date">{formatDate(post.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="post-content">
          <p>{post.content}</p>
        </div>
      </div>

      <div className="replies-section">
        <h2>Discussion ({replies.length})</h2>

        <form onSubmit={handleReplySubmit} className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={isAuthenticated ? "Share your thoughts..." : "Please login to reply"}
            rows={4}
            disabled={!isAuthenticated}
          />
          <button type="submit" disabled={submitting || !isAuthenticated || !replyContent.trim()}>
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="replies-list">
          {replies.length === 0 ? (
            <div className="no-replies">
              <p>No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="reply-card">
                <div className="reply-author">
                  <div className="author-avatar-small">
                    {reply.author?.profile_picture ? (
                      <img src={reply.author.profile_picture} alt={reply.author.full_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {reply.author?.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="reply-author-name">{reply.author?.full_name}</div>
                    <div className="reply-date">{formatDate(reply.created_at)}</div>
                  </div>
                </div>
                <div className="reply-content">
                  <p>{reply.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
