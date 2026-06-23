import api from './api';

const analyticsService = {
  getDashboardSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },

  getExpensesByCategory: async () => {
    const response = await api.get('/analytics/expenses-by-category');
    return response.data;
  },

  getTopDestinations: async () => {
    const response = await api.get('/analytics/top-destinations');
    return response.data;
  },

  getTripsByMonth: async () => {
    const response = await api.get('/analytics/trips-by-month');
    return response.data;
  }
};

export default analyticsService;
