import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { checkPanelStatus } from '../services/api';

const AppContext = createContext(null);

/**
 * AppProvider
 * - Calls panel-check-status on mount (public, no auth needed).
 * - Stores company_detils, appVersion, and image_url array globally.
 */
export function AppProvider({ children }) {
  const [appStatus, setAppStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [companyInfo, setCompanyInfo] = useState(null);
  const [appVersion, setAppVersion] = useState(null);
  const [imageUrlConfig, setImageUrlConfig] = useState([]);
  const [dotenvConfig, setDotenvConfig] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await checkPanelStatus();
        const company = data?.company_detils || data?.company_details || null;
        const version = data?.version?.version_panel || null;
        const imageUrls = data?.image_url || [];

        setCompanyInfo(company);
        setAppVersion(version);
        setImageUrlConfig(imageUrls);
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

  /** Helper to construct full company logo URL */
  const companyLogoUrl = useMemo(() => {
    if (!companyInfo?.company_logo) return null;
    const companyImgObj = (imageUrlConfig || []).find((i) => i.image_for === 'Company');
    const baseUrl = companyImgObj?.image_url || 'https://sriparshwacards.in/crmapi/public/assets/images/company_images/';
    if (companyInfo.company_logo.startsWith('http')) return companyInfo.company_logo;
    return `${baseUrl.replace(/\/$/, '')}/${companyInfo.company_logo}`;
  }, [companyInfo, imageUrlConfig]);

  /** Helper for No Image default fallback URL */
  const noImageUrl = useMemo(() => {
    const noImgObj = (imageUrlConfig || []).find((i) => i.image_for === 'No Image');
    return noImgObj?.image_url || 'https://sriparshwacards.in/crmapi/public/assets/images/no_image.jpg';
  }, [imageUrlConfig]);

  const value = useMemo(
    () => ({
      appStatus,
      companyInfo,
      appVersion,
      imageUrlConfig,
      companyLogoUrl,
      noImageUrl,
      dotenvConfig,
      setDotenv,
    }),
    [appStatus, companyInfo, appVersion, imageUrlConfig, companyLogoUrl, noImageUrl, dotenvConfig],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

export default AppContext;
