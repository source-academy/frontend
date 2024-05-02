import 'src/i18n/i18n';
import 'src/styles/index.scss';

import { Button, OverlaysProvider } from '@blueprintjs/core';
import * as Sentry from '@sentry/browser';
import { setModulesStaticURL } from 'js-slang/dist/modules/loader';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import Constants, { Links } from 'src/commons/utils/Constants';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import { register as registerServiceWorker } from 'src/commons/utils/RegisterServiceWorker';
import { triggerSyncLogs } from 'src/features/eventLogging/client';
import { store } from 'src/pages/createStore';

import ApplicationWrapper from './commons/application/ApplicationWrapper';
import { createInBrowserFileSystem } from './pages/fileSystem/createInBrowserFileSystem';

if (Constants.sentryDsn) {
  Sentry.init({
    dsn: Constants.sentryDsn,
    environment: Constants.sourceAcademyEnvironment,
    release: `cadet-frontend@${Constants.sourceAcademyVersion}`
  });
  const userId = store.getState().session.userId;
  Sentry.setUser(typeof userId !== 'undefined' ? { id: userId.toString() } : null);
}

const rootContainer = document.getElementById('root') as HTMLElement;
const root = createRoot(rootContainer);
(window as any).__REDUX_STORE__ = store; // need this for slang's display
console.log(
  `%cSource Academy ${Constants.sourceAcademyEnvironment}-${Constants.sourceAcademyVersion}; ` +
    `Please visit ${Links.githubIssues} to report bugs or issues.`,
  'font-weight: bold;'
);

setModulesStaticURL(Constants.moduleBackendUrl);
console.log(`Using module backend: ${Constants.moduleBackendUrl}`);

// Initialise the browser file system before rendering to avoid race conditions on the file system.
createInBrowserFileSystem(store)
  .catch(err => console.error(err))
  .finally(() => {
    root.render(
      <Provider store={store}>
        <OverlaysProvider>
          <ApplicationWrapper />
        </OverlaysProvider>
      </Provider>
    );
  });

registerServiceWorker({
  onUpdate: registration => {
    showWarningMessage(
      <div>
        <span>A new version of Source Academy is available.&nbsp;</span>
        <Button
          onClick={() => {
            if (registration && registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
          }}
        >
          Refresh now
        </Button>
      </div>,
      0
    );
  }
});

if (Constants.cadetLoggerUrl) {
  // Seriously: registerServiceWorker onSuccess and onUpdate are separate paths.
  // Neither of them actually fire in localhost...
  const sync = () => triggerSyncLogs(store.getState().session.accessToken);
  navigator.serviceWorker.ready.then(() => {
    setInterval(sync, Constants.cadetLoggerInterval);
  });
}
