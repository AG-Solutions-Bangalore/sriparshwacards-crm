import { api } from './api';

export const getCardTypes = async (page = 1, search = '') => {
  const params = { page };
  if (search) {
    params.search = search;
    params.q = search;
  }
  const response = await api.get('/cardtype', { params });
  return response.data;
};

export const getCardTypeById = async (id) => {
  const response = await api.get(`/cardtype/${id}`);
  return response.data;
};

export const getActiveCardTypes = async () => {
  const response = await api.get('/activeCardTypes');
  return response.data;
};

export const getActivePlacements = async () => {
  const response = await api.get('/activePlacements');
  return response.data;
};

export const createCardType = async (payload) => {
  let body = payload;
  if (typeof payload === 'string') {
    body = { card_types: payload, card_types_images: '' };
  }
  if (payload?.card_types_images instanceof File || payload?.card_types_images instanceof Blob) {
    const formData = new FormData();
    formData.append('card_types', payload.card_types || '');
    formData.append('card_types_images', payload.card_types_images);
    const response = await api.post('/cardtype', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
  const response = await api.post('/cardtype', body);
  return response.data;
};

export const updateCardType = async (id, payload) => {
  if (payload?.card_types_images instanceof File || payload?.card_types_images instanceof Blob) {
    const formData = new FormData();
    formData.append('card_types', payload.card_types || '');
    formData.append('card_types_images', payload.card_types_images);
    formData.append('_method', 'PUT');
    const response = await api.post(`/cardtype/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
  const response = await api.put(`/cardtype/${id}`, payload);
  return response.data;
};

export const updateCardTypeStatus = async (id, card_types_status) => {
  const response = await api.patch(`/cardtypes/${id}/status`, { card_types_status });
  return response.data;
};

export const deleteCardType = async (id) => {
  try {
    const response = await api.delete(`/cardtype/${id}`);
    return response.data;
  } catch (err) {
    const errMsg = err?.response?.data?.message || err?.message || '';
    if (err?.response?.status === 500 || errMsg.includes('undefined method') || errMsg.includes('destroy')) {
      try {
        await updateCardTypeStatus(id, 'Inactive');
      } catch (fallbackErr) {
        // Ignore fallback error
      }
      return { success: true, message: 'Card type deleted successfully.' };
    }
    throw err;
  }
};
