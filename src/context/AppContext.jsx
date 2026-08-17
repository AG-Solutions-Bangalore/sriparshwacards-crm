import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { checkPanelStatus } from '../services/api';

const AppContext = createContext(null);

/**
 * AppProvider
 * - Calls panel-check-status on mount (public, no auth needed).
 * - Stores company info and app version globally.
 * - Shows a full-screen maintenance banner if the API is unreachable.
 */
export function AppProvider({ children }) {
  const [appStatus, setAppStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [companyInfo, setCompanyInfo] = useState(null);
  const [appVersion, setAppVersion] = useState(null);
  const [dotenvConfig, setDotenvConfig] = useState(null); // set after login via setDotenv

  useEffect(() => {
    (async () => {
      try {
        const data = await checkPanelStatus();
        const company = data?.company_detils || data?.company_details || null;
        const version = data?.version?.version_panel || null;

        setCompanyInfo(company);
        setAppVersion(version);
        setAppStatus('ok');

        console.info(
          `[AppContext] Backend OK — v${version} | Company: ${company?.company_name ?? 'N/A'}`,
        );
      } catch (err) {
        console.error('[AppContext] panel-check-status failed:', err.message);
        setAppStatus('error');
      }
    })();
  }, []);

  /** Called after login to store server-side env config */
  const setDotenv = (config) => {
    setDotenvConfig(config);
  };

  const value = useMemo(
    () => ({
      appStatus,
      companyInfo,
      appVersion,
      dotenvConfig,
      setDotenv,
    }),
    [appStatus, companyInfo, appVersion, dotenvConfig],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

export default AppContext;
