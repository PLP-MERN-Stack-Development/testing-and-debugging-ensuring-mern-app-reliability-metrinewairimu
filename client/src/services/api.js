import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.config.url, response.data);
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw {
            message: data.message || 'Bad request',
            errors: data.errors,
            type: 'validation'
          };
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw {
            message: 'Session expired. Please login again.',
            type: 'auth'
          };
        case 403:
          throw {
            message: 'You do not have permission to perform this action.',
            type: 'permission'
          };
        case 404:
          throw {
            message: 'Resource not found.',
            type: 'not-found'
          };
        case 500:
          throw {
            message: 'Server error. Please try again later.',
            type: 'server'
          };
        default:
          throw {
            message: data?.message || 'An unexpected error occurred.',
            type: 'unknown'
          };
      }
    } else if (error.request) {
      // Request was made but no response received
      throw {
        message: 'Network error. Please check your connection.',
        type: 'network'
      };
    } else {
      // Something happened in setting up the request
      throw {
        message: 'An error occurred while setting up the request.',
        type: 'setup'
      };
    }
  }
);

// Health check function
api.healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error };
  }
};

export default api;