import api from './api';

// Trip Service
// Contains all API calls related to trips (CRUD)

const tripService = {
  getTrips: async () => {
    const response = await api.get('/trips');
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
