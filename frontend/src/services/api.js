import axios from 'axios';

const API_BASE_URL = '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  applyAsMentor: (mentorData) => api.post('/auth/mentor/apply', mentorData),
  uploadProfilePicture: (formData) => api.post('/auth/upload-profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Bookings API
export const bookingsAPI = {
  getMentors: (params) => api.get('/bookings/mentors', { params }),
  getMentorById: (id) => api.get(`/bookings/mentors/${id}`),
  getMentorAvailability: (mentorId) => api.get(`/bookings/availability/${mentorId}`),
  createBooking: (bookingData) => api.post('/bookings/book', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getMentorBookings: () => api.get('/bookings/mentor-bookings'),
};

// Courses API
export const coursesAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
  createCourse: (courseData) => api.post('/courses', courseData),
  enrollInCourse: (enrollmentData) => api.post('/courses/enroll', enrollmentData),
  getMyEnrollments: () => api.get('/courses/my-enrollments'),
};

// Community API
export const communityAPI = {
  getGroups: (params) => api.get('/community/groups', { params }),
  getGroup: (id) => api.get(`/community/groups/${id}`),
  createGroup: (groupData) => api.post('/community/groups', groupData),
  getPosts: (params) => api.get('/community/posts', { params }),
  getPost: (id) => api.get(`/community/posts/${id}`),
  createPost: (postData) => api.post('/community/posts', postData),
  getReplies: (postId) => api.get(`/community/posts/${postId}/replies`),
  createReply: (replyData) => api.post('/community/replies', replyData),
};

// Admin API
export const adminAPI = {
  getPendingMentors: () => api.get('/admin/pending-mentors'),
  approveMentor: (approvalData) => api.post('/admin/approve-mentor', approvalData),
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
};

export default api;
