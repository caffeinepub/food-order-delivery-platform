import { useState, useCallback } from 'react';

const STORAGE_KEY = 'courierAccess';
const CORRECT_PIN = '1953';

export function useCourierAccess() {
  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const grantAccess = useCallback((pin: string): boolean => {
    if (pin === CORRECT_PIN) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore storage errors
      }
      setHasAccess(true);
      return true;
    }
    return false;
  }, []);

  const revokeAccess = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    setHasAccess(false);
  }, []);

  return { hasAccess, grantAccess, revokeAccess };
}
