import api from './api';

const activityService = {
  getActivitiesByTrip: async (tripId) => {
    const response = await api.get(`/activities/trip/${tripId}`);
    return response.data;
  },

  searchActivities: async (tripId, query) => {
    const response = await api.get(`/activities/search?tripId=${tripId}&q=${query}`);
    return response.data;
  },

  createActivity: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },

  updateActivity: async (id, activityData) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  }
};

export default activityService;
