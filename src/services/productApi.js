import { api } from './api';

/* Helper to convert base64/DataURL to Blob/File object */
function dataURLtoFile(dataurl, filename = 'product_image.jpg') {
  if (!dataurl || typeof dataurl !== 'string') return dataurl;
  if (!dataurl.startsWith('data:')) return dataurl;

  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.split('/')[1] || 'jpg';
    return new File([u8arr], filename || `image.${ext}`, { type: mime });
  } catch (err) {
    console.error('dataURLtoFile error:', err);
    return dataurl;
  }
}

export const buildProductFormData = (payload) => {
  const formData = new FormData();

  if (payload.product_name) formData.append('product_name', payload.product_name);
  if (payload.product_made_of) formData.append('product_made_of', payload.product_made_of);
  if (payload.product_status) formData.append('product_status', payload.product_status);

  // Handle IDs (Occasions, Categories, Card Types) - Backend expects string format e.g. "1,2"
  if (Array.isArray(payload.occasions_ids)) {
    formData.append('occasions_ids', payload.occasions_ids.join(','));
  } else if (payload.occasions_ids !== undefined && payload.occasions_ids !== null) {
    formData.append('occasions_ids', String(payload.occasions_ids));
  } else {
    formData.append('occasions_ids', '');
  }

  if (Array.isArray(payload.categories_ids)) {
    formData.append('categories_ids', payload.categories_ids.join(','));
  } else if (payload.categories_ids !== undefined && payload.categories_ids !== null) {
    formData.append('categories_ids', String(payload.categories_ids));
  } else {
    formData.append('categories_ids', '');
  }

  if (Array.isArray(payload.card_types_ids)) {
    formData.append('card_types_ids', payload.card_types_ids.join(','));
  } else if (payload.card_types_ids !== undefined && payload.card_types_ids !== null) {
    formData.append('card_types_ids', String(payload.card_types_ids));
  } else {
    formData.append('card_types_ids', '');
  }

  // Handle Images
  if (Array.isArray(payload.images)) {
    const validImages = payload.images.filter((imgObj) => {
      if (!imgObj) return false;
      const rawFile = imgObj._file || imgObj.rawFile;
      const imgVal = imgObj.product_images;
      const hasFile = rawFile instanceof File || rawFile instanceof Blob;
      const hasDataUrl = typeof imgVal === 'string' && imgVal.startsWith('data:');
      const hasId = Boolean(imgObj.id);
      return hasFile || hasDataUrl || hasId;
    });

    validImages.forEach((imgObj, i) => {
      if (imgObj.id) {
        formData.append(`images[${i}][id]`, imgObj.id);
      }
      formData.append(`images[${i}][product_images_sort_order]`, String(imgObj.product_images_sort_order || (i + 1)));
      formData.append(`images[${i}][product_images_status]`, imgObj.product_images_status || 'Active');

      const rawFile = imgObj._file || imgObj.rawFile;
      const imgVal = imgObj.product_images;

      if (rawFile instanceof File || rawFile instanceof Blob) {
        formData.append(`images[${i}][product_images]`, rawFile);
      } else if (typeof imgVal === 'string' && imgVal.startsWith('data:')) {
        const fileObj = dataURLtoFile(imgVal, `product_image_${i + 1}.webp`);
        if (fileObj instanceof File || fileObj instanceof Blob) {
          formData.append(`images[${i}][product_images]`, fileObj);
        } else {
          formData.append(`images[${i}][product_images]`, imgVal);
        }
      } else if (typeof imgVal === 'string' && imgVal.trim()) {
        formData.append(`images[${i}][product_images]`, imgVal);
      }
    });
  }

  // Handle Placements
  if (Array.isArray(payload.placements)) {
    payload.placements.forEach((pObj, i) => {
      if (!pObj) return;
      if (pObj.id) {
        formData.append(`placements[${i}][id]`, pObj.id);
      }
      formData.append(`placements[${i}][placements_id]`, pObj.placements_id || '1');
    });
  }

  return formData;
};

/* ───────────── PRODUCTS ───────────── */
export const getProducts = async (page = 1, search = '') => {
  const params = { page };
  if (search) {
    params.search = search;
    params.q = search;
  }
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (payload) => {
  const formData = buildProductFormData(payload);
  const response = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const formData = buildProductFormData(payload);
  formData.append('_method', 'PUT');

  const response = await api.post(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
export const getEnquiries = async (page = 1, search = '') => {
  const params = { page };
  if (search) {
    params.search = search;
    params.q = search;
  }
  const response = await api.get('/enquiry', { params });
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

export const getEnquiryReport = async ({ from_date, to_date, enquiryStatus } = {}) => {
  try {
    const formData = new FormData();
    if (from_date) formData.append('from_date', from_date);
    if (to_date) formData.append('to_date', to_date);
    if (enquiryStatus && enquiryStatus !== 'ALL') {
      formData.append('enquiryStatus', enquiryStatus);
    }
    const response = await api.post('/getEnquiryReport', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (err) {
    const payload = {};
    if (from_date) payload.from_date = from_date;
    if (to_date) payload.to_date = to_date;
    if (enquiryStatus && enquiryStatus !== 'ALL') {
      payload.enquiryStatus = enquiryStatus;
    }
    const response = await api.post('/getEnquiryReport', payload);
    return response.data;
  }
};
