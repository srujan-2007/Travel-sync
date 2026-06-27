import api from './api';

// Authentication Service
// Contains all API calls related to user authentication

const authService = {
  // Make a POST request to login API
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Make a POST request to signup API
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Make a POST request to Google login API
  loginWithGoogle: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

export default authService;
