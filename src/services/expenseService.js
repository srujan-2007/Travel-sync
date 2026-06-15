import api from './api';

// Expense Service
// Contains all API calls related to trip expenses

const expenseService = {
  getExpensesByTrip: async (tripId) => {
    const response = await api.get(`/expenses/trip/${tripId}`);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;
