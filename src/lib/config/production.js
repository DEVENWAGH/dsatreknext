// Production configuration
export const PRODUCTION_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  // Database Configuration
  DATABASE: {
    CONNECTION_TIMEOUT: 10000,
    IDLE_TIMEOUT: 20000,
    MAX_CONNECTIONS: 10,
  },

  // Error Handling
  ERROR_HANDLING: {
    SHOW_STACK_TRACE: process.env.NODE_ENV === 'development',
    LOG_ERRORS: true,
    FALLBACK_ERROR_MESSAGE: 'Something went wrong. Please try again.',
  },

  // Performance
  PERFORMANCE: {
    ENABLE_CACHING: true,
    CACHE_TTL: 300000, // 5 minutes
    DEBOUNCE_DELAY: 300,
  },

  // Security
  SECURITY: {
    CORS_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://dsatrek.com',
    ],
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
    },
  },
};

export default PRODUCTION_CONFIG;
