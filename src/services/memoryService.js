import api from './api';

// Memory Service
// Contains all API calls related to trip memories (photos/notes)

const memoryService = {
  getMemoriesByTrip: async (tripId) => {
    const response = await api.get(`/memories/trip/${tripId}`);
    return response.data;
  },

  getMemoryTimeline: async (tripId) => {
    const response = await api.get(`/memories/timeline/${tripId}`);
    return response.data;
  },

  searchMemories: async (tripId, query) => {
    const response = await api.get(`/memories/search?tripId=${tripId}&q=${query}`);
    return response.data;
  },

  createMemory: async (memoryData) => {
    const response = await api.post('/memories', memoryData);
    return response.data;
  },

  updateMemory: async (id, memoryData) => {
    const response = await api.put(`/memories/${id}`, memoryData);
    return response.data;
  },

  deleteMemory: async (id) => {
    const response = await api.delete(`/memories/${id}`);
    return response.data;
  }
};

export default memoryService;
