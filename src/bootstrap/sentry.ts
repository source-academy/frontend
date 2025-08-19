import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType
} from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { store } from 'src/pages/createStore';

export const initializeSentryLogging = () => {
  if (!Constants.sentryDsn) {
    return;
  }
  Sentry.init({
    dsn: Constants.sentryDsn,
    environment: Constants.sourceAcademyEnvironment,
    release: `cadet-frontend@${Constants.sourceAcademyVersion}`,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      }),
      Sentry.replayIntegration()
    ]
  });
  const userId = store.getState().session.userId;
  Sentry.setUser(typeof userId !== 'undefined' ? { id: userId.toString() } : null);
};
