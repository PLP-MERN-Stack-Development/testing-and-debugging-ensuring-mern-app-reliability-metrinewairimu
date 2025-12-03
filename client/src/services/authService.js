import api from './api';

const authService = {
  // Register new user
  register: (userData) => {
    console.log('Registering user:', userData.email);
    return api.post('/auth/register', userData);
  },

  // Login user
  login: (credentials) => {
    console.log('Logging in user:', credentials.email);
    return api.post('/auth/login', credentials);
  },

  // Get current user
  getCurrentUser: () => {
    console.log('Getting current user');
    return api.get('/auth/me');
  },

  // Logout user
  logout: () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set auth token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Set user data
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Update user in localStorage
  updateUser: (updates) => {
    const user = authService.getUser();
    if (user) {
      const updatedUser = { ...user, ...updates };
      authService.setUser(updatedUser);
    }
  }
};

export default authService;