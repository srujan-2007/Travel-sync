import api from './api';

const locationService = {
  getLocationsByTrip: async (tripId) => {
    const response = await api.get(`/locations/trip/${tripId}`);
    return response.data;
  },

  createLocation: async (locationData) => {
    const response = await api.post('/locations', locationData);
    return response.data;
  },

  updateLocation: async (id, locationData) => {
    const response = await api.put(`/locations/${id}`, locationData);
    return response.data;
  },

  deleteLocation: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  }
};

export default locationService;
