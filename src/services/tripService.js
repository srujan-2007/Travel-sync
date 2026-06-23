import api from './api';

// Trip Service
// Contains all API calls related to trips (CRUD)

const tripService = {
  getTrips: async (params = {}) => {
    // Remove empty string parameters
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = queryString ? `/trips?${queryString}` : '/trips';
    const response = await api.get(endpoint);
    return response.data;
  },

  searchTrips: async (query) => {
    const response = await api.get(`/trips/search?q=${query}`);
    return response.data;
  },
  
  getTripById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  createTrip: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  updateTrip: async (id, tripData) => {
    const response = await api.put(`/trips/${id}`, tripData);
    return response.data;
  },

  deleteTrip: async (id) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  }
};

export default tripService;
