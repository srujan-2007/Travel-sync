import api from './api';

// Upload Service
// Contains API calls related to file uploads

const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('media', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data; // { url: '...' }
  }
};

export default uploadService;
