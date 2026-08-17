import { useCallback, useEffect, useRef, useState } from 'react';

const TOTAL_SESSION_TIMEOUT_MS = 5 * 60 * 1000;
const WARNING_WINDOW_MS = 30 * 1000;

export const useSessionTimeout = (isAuthenticated, onExpire, onWarning) => {
  const warningTimerRef = useRef(null);
  const expireTimerRef = useRef(null);
  const warningShownRef = useRef(false);
  const expiredRef = useRef(false);

  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (expireTimerRef.current) {
      clearTimeout(expireTimerRef.current);
      expireTimerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();

    if (!isAuthenticated) {
      warningShownRef.current = false;
      expiredRef.current = false;
      setIsWarningVisible(false);
      setIsExpired(false);
      return;
    }

    warningTimerRef.current = setTimeout(() => {
      warningShownRef.current = true;
      setIsWarningVisible(true);
      onWarning?.();
    }, TOTAL_SESSION_TIMEOUT_MS - WARNING_WINDOW_MS);

    expireTimerRef.current = setTimeout(() => {
      expiredRef.current = true;
      setIsExpired(true);
      setIsWarningVisible(false);
      onExpire?.();
    }, TOTAL_SESSION_TIMEOUT_MS);
  }, [clearTimers, isAuthenticated, onExpire, onWarning]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      warningShownRef.current = false;
      expiredRef.current = false;
      setIsWarningVisible(false);
      setIsExpired(false);
      return undefined;
    }

    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      if (warningShownRef.current || expiredRef.current) {
        return;
      }

      resetTimer();
    };

    events.forEach((eventName) => window.addEventListener(eventName, handleActivity));
    resetTimer();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      clearTimers();
    };
  }, [clearTimers, isAuthenticated, resetTimer]);

  return {
    isWarningVisible,
    isExpired,
    resetTimer,
    clearTimers,
    setIsWarningVisible,
    setIsExpired,
  };
};
