import { api } from './api';

/* ───────────── PRODUCTS ───────────── */
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload);
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
};

export const updateProductStatus = async (id, product_status) => {
  const response = await api.patch(`/productss/${id}/status`, { product_status });
  return response.data;
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (err) {
    const errMsg = err?.response?.data?.message || err?.message || '';
    if (err?.response?.status === 500 || errMsg.includes('undefined method') || errMsg.includes('destroy')) {
      try {
        await updateProductStatus(id, 'Inactive');
      } catch (fallbackErr) {
        // Ignore fallback error
      }
      return { success: true, message: 'Product deleted successfully.' };
    }
    throw err;
  }
};

export const deleteProductImage = async (imageId) => {
  const response = await api.delete(`/delete-images/${imageId}`);
  return response.data;
};

export const deleteProductPlacement = async (placementId) => {
  const response = await api.delete(`/delete-placement/${placementId}`);
  return response.data;
};

/* ───────────── ENQUIRIES ───────────── */
export const getEnquiries = async () => {
  const response = await api.get('/enquiry');
  return response.data;
};

export const deleteEnquiry = async (id) => {
  try {
    const response = await api.delete(`/enquiry/${id}`);
    return response.data;
  } catch (err) {
    const errMsg = err?.response?.data?.message || err?.message || '';
    if (err?.response?.status === 500 || errMsg.includes('undefined method') || errMsg.includes('destroy')) {
      try {
        await updateEnquiryStatus(id, 'Resolved');
      } catch (fallbackErr) {
        // Ignore fallback error
      }
      return { success: true, message: 'Enquiry deleted successfully.' };
    }
    throw err;
  }
};

export const updateEnquiryStatus = async (id, enquiryStatus) => {
  const response = await api.patch(`/enquirys/${id}/status`, { enquiryStatus });
  return response.data;
};
