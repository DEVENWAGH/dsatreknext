'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Simple SWR-like hook for data fetching with caching
export const useDataFetch = (key, fetcher, options = {}) => {
  const { revalidateOnFocus = false, dedupingInterval = 2000 } = options;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchTime = useRef(0);
  const cache = useRef(new Map());

  const fetchData = useCallback(
    async (force = false) => {
      const now = Date.now();

      // Check cache first
      if (!force && cache.current.has(key)) {
        const cached = cache.current.get(key);
        if (now - cached.timestamp < dedupingInterval) {
          setData(cached.data);
          setIsLoading(false);
          return cached.data;
        }
      }

      // Prevent duplicate requests
      if (!force && now - lastFetchTime.current < 100) return;

      lastFetchTime.current = now;
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        cache.current.set(key, { data: result, timestamp: now });
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [key, fetcher, dedupingInterval]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, revalidateOnFocus]);

  return { data, error, isLoading, mutate: fetchData };
};
