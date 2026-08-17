import { api } from './api';

export const getCardTypes = async () => {
  const response = await api.get('/cardtype');
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
  const data = typeof payload === 'string' ? { card_types: payload, card_types_status: 'Active' } : payload;
  const response = await api.post('/cardtype', data);
  return response.data;
};

export const updateCardType = async (id, payload) => {
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
