'use client';

import { useEffect, useState } from 'react';

export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          if (key.includes('theme')) {
            setStoredValue(item);
          } else {
            try {
              setStoredValue(JSON.parse(item));
            } catch {
              setStoredValue(item);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key, isClient]);

  const setValue = value => {
    try {
      setStoredValue(value);
      if (isClient) {
        if (key.includes('theme')) {
          window.localStorage.setItem(key, value);
        } else {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export const useWindow = () => {
  const isClient = useIsClient();
  return isClient ? window : null;
};

export const useMediaQuery = query => {
  const [matches, setMatches] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = event => setMatches(event.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query, isClient]);

  return matches;
};
