import axios from 'axios';
import { CONFIG } from '../config/constants';

// Create a reusable Axios instance
// This centralizes our API configuration, making it easy to attach 
// authentication tokens or handle global errors later.
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
// Automatically attaches the JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Placeholder)
// In the future, we can handle global 401 Unauthorized errors here
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // TODO: Handle global errors
    return Promise.reject(error);
  }
);

export default api;
