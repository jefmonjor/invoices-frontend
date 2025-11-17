export const env = {
  // API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // Environment
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Feature Flags
  enableWebSockets: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

  // Sentry
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  sentryEnvironment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',

  // App
  appName: import.meta.env.VITE_APP_NAME || 'Invoices Management System',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const;

// Type-safe environment validation
export function validateEnv() {
  const required = [
    'VITE_API_BASE_URL',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Validate on load in development
if (env.isDevelopment) {
  validateEnv();
}
