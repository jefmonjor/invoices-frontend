import * as Sentry from '@sentry/react';
import { env } from './env';

export const initSentry = () => {
  if (env.isProduction && env.sentryDsn) {
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.sentryEnvironment,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

export default Sentry;
