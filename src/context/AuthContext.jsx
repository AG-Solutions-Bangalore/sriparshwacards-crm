import { createContext, useContext, useMemo, useState } from 'react';

import { fetchPanelDotenv, logoutUser } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'sp_cards_token';
const USER_KEY  = 'sp_cards_user';
const DOTENV_KEY = 'sp_cards_dotenv';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser]   = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [dotenvConfig, setDotenvConfig] = useState(() => {
    const saved = localStorage.getItem(DOTENV_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  /* ── LOGIN ── */
  const login = async (payload) => {
    const responseData = payload?.data || payload || {};
    const userInfo =
      responseData?.UserInfo ||
      responseData?.userInfo ||
      responseData?.data?.UserInfo ||
      responseData;

    const nextToken =
      userInfo?.token ||
      responseData.token ||
      responseData.access_token ||
      responseData?.data?.token ||
      responseData?.data?.access_token;

    if (!nextToken) {
      throw new Error('Invalid username or password. Please check your credentials and try again.');
    }

    const nextUser =
      userInfo?.user ||
      responseData.user ||
      responseData?.data?.user || {
        username:
          responseData.username ||
          responseData?.data?.username ||
          userInfo?.name ||
          'Admin',
      };

    // Persist auth
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    // Fetch server-side dotenv config right after login
    try {
      const envData = await fetchPanelDotenv();
      localStorage.setItem(DOTENV_KEY, JSON.stringify(envData));
      setDotenvConfig(envData);
      console.info('[AuthContext] panel-fetch-dotenv loaded:', envData);
    } catch (err) {
      // Non-fatal — app continues even if dotenv fetch fails
      console.warn('[AuthContext] panel-fetch-dotenv failed (non-fatal):', err.message);
    }
  };

  /* ── LOGOUT ── */
  const logout = async () => {
    try {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (currentToken) await logoutUser();
    } catch (err) {
      console.warn('[AuthContext] Logout API call failed:', err.message);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(DOTENV_KEY);
      setToken(null);
      setUser(null);
      setDotenvConfig(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      dotenvConfig,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, dotenvConfig],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider');
  return context;
};

export default AuthContext;
