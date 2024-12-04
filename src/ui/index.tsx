import * as Sentry from '@sentry/react'
import mixpanel from 'mixpanel-figma'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('app'),
  root = createRoot(container)

mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN ?? '', {
  debug: process.env.NODE_ENV === 'development',
  disable_persistence: true,
  disable_cookie: true,
  opt_out_tracking_by_default: true,
})

Sentry.init({
  dsn:
    process.env.NODE_ENV === 'development'
      ? undefined
      : process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      autoInject: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

root.render(<App />)
