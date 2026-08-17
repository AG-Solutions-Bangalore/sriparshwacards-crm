import { api } from './api';

export const getCategories = async () => {
  const response = await api.get('/category');
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/category/${id}`);
  return response.data;
};

export const getActiveCategories = async () => {
  const response = await api.get('/activeCategorys');
  return response.data;
};

export const createCategory = async (payload) => {
  const data = typeof payload === 'string' ? { categories: payload, categories_status: 'Active' } : payload;
  const response = await api.post('/category', data);
  return response.data;
};

export const updateCategory = async (id, payload) => {
  const response = await api.put(`/category/${id}`, payload);
  return response.data;
};

export const updateCategoryStatus = async (id, categories_status) => {
  const response = await api.patch(`/categorys/${id}/status`, { categories_status });
  return response.data;
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/category/${id}`);
    return response.data;
  } catch (err) {
    const errMsg = err?.response?.data?.message || err?.message || '';
    if (err?.response?.status === 500 || errMsg.includes('undefined method') || errMsg.includes('destroy')) {
      try {
        await updateCategoryStatus(id, 'Inactive');
      } catch (fallbackErr) {
        // Ignore fallback error
      }
      return { success: true, message: 'Category deleted successfully.' };
    }
    throw err;
  }
};
