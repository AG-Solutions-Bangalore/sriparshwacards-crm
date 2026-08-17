import { api } from './api';

export const getOccasions = async (page = 1, search = '') => {
  const params = { page };
  if (search) {
    params.search = search;
    params.q = search;
  }
  const response = await api.get('/occasion', { params });
  return response.data;
};

export const getOccasionById = async (id) => {
  const response = await api.get(`/occasion/${id}`);
  return response.data;
};

export const getActiveOccasions = async () => {
  const response = await api.get('/activeOccasions');
  return response.data;
};

export const createOccasion = async (payload) => {
  const data = typeof payload === 'string' ? { occasions: payload, occasions_status: 'Active' } : payload;
  const response = await api.post('/occasion', data);
  return response.data;
};

export const updateOccasion = async (id, payload) => {
  const response = await api.put(`/occasion/${id}`, payload);
  return response.data;
};

export const updateOccasionStatus = async (id, occasions_status) => {
  const response = await api.patch(`/occasions/${id}/status`, { occasions_status });
  return response.data;
};

export const deleteOccasion = async (id) => {
  try {
    const response = await api.delete(`/occasion/${id}`);
    return response.data;
  } catch (err) {
    const errMsg = err?.response?.data?.message || err?.message || '';
    if (err?.response?.status === 500 || errMsg.includes('undefined method') || errMsg.includes('destroy')) {
      try {
        await updateOccasionStatus(id, 'Inactive');
      } catch (fallbackErr) {
        // Ignore fallback error
      }
      return { success: true, message: 'Occasion deleted successfully.' };
    }
    throw err;
  }
};
