import { useState, useEffect } from 'react';

const CACHE_KEY = 'dsatrek-image-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useImageCache = () => {
  const [cache, setCache] = useState({});

  useEffect(() => {
    const savedCache = localStorage.getItem(CACHE_KEY);
    if (savedCache) {
      const parsed = JSON.parse(savedCache);
      const now = Date.now();

      // Filter out expired entries
      const validCache = Object.entries(parsed).reduce((acc, [key, value]) => {
        if (now - value.timestamp < CACHE_DURATION) {
          acc[key] = value;
        }
        return acc;
      }, {});

      setCache(validCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(validCache));
    }
  }, []);

  const cacheImage = (url, blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const newCache = {
        ...cache,
        [url]: {
          data: reader.result,
          timestamp: Date.now(),
        },
      };
      setCache(newCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    };
    reader.readAsDataURL(blob);
  };

  const getCachedImage = url => {
    const cached = cache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  const prefetchImages = async urls => {
    const promises = urls.map(async url => {
      if (!getCachedImage(url)) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          cacheImage(url, blob);
        } catch (error) {
          console.warn('Failed to prefetch image:', url);
        }
      }
    });

    await Promise.all(promises);
  };

  return { getCachedImage, prefetchImages };
};
