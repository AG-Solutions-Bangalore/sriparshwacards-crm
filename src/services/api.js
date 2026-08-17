import axios from 'axios';

const getBaseURL = () => {
  const envBaseURL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.REACT_APP_API_BASE_URL ||
    'https://sriparshwacards.in/crmapi/public/api';

  return envBaseURL.replace(/\/$/, '');
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_cards_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const loginUser = async ({ username, password }) => {
  try {
    const response = await api.post('/panel-login', {
      username,
      password,
    });

    const responseData = response?.data || {};
    const userInfo = responseData?.UserInfo || responseData?.userInfo || responseData?.data?.UserInfo;

    if (!userInfo?.token && !responseData?.token && !responseData?.access_token) {
      throw new Error('Invalid username or password. Please check your credentials and try again.');
    }

    return responseData;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Invalid username or password. Please check your credentials and try again.';

    throw new Error(message);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/panel-logout');
    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Unable to logout. Please try again.';

    throw new Error(message);
  }
};

export const sendPasswordResetEmail = async ({ username, email }) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);

  try {
    const response = await api.post('/panel-send-password', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Unable to send password reset request. Please check your details and try again.';

    throw new Error(message);
  }
};

export const changeUserPassword = async ({ username, old_password, new_password }) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('old_password', old_password);
  formData.append('new_password', new_password);

  try {
    const response = await api.post('/panel-change-password', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Unable to change password. Please check your current password and try again.';

    throw new Error(message);
  }
};

/**
 * panel-check-status
 * Public endpoint (no auth). Called at app startup.
 * Returns: { code, success, message, version: { version_panel }, company_detils: { company_name, ... } }
 */
export const checkPanelStatus = async () => {
  const response = await api.get('/panel-check-status');
  return response.data;
};

/**
 * panel-fetch-dotenv
 * Protected endpoint (requires Bearer token). Called after login.
 * Returns runtime environment config from the server.
 */
export const fetchPanelDotenv = async () => {
  const response = await api.get('/panel-fetch-dotenv');
  return response.data;
};

/**
 * panel-fetch-profile
 * GET — fetch the logged-in user's profile.
 */
export const fetchProfile = async () => {
  const response = await api.get('/panel-fetch-profile');
  return response.data;
};

/**
 * panel-update-profile
 * PUT — update profile fields (mobile, email) via FormData.
 */
export const updateProfile = async ({ mobile, email }) => {
  try {
    const response = await api.put('/panel-update-profile', {
      mobile: String(mobile || '').trim(),
      email: String(email || '').trim(),
    });
    return response.data;
  } catch (jsonErr) {
    const formData = new FormData();
    formData.append('mobile', String(mobile || '').trim());
    formData.append('email', String(email || '').trim());
    formData.append('_method', 'PUT');

    const response = await api.post('/panel-update-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};

