import 'src/i18n/i18n';
import 'src/styles/global.css';
import 'src/styles/index.scss';
// Expose shared libs for dynamically-loaded Conductor web plugins (must run before any plugin loads).
import 'src/bootstrap/conductorSharedDeps';

import { Button, OverlaysProvider } from '@blueprintjs/core';
import { setModulesStaticURL } from 'js-slang/dist/modules/loader';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import Constants, { Links } from 'src/commons/utils/Constants';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import {
  register as registerServiceWorker,
  unregister as unregisterServiceWorker,
} from 'src/commons/utils/RegisterServiceWorker';
import { triggerSyncLogs } from 'src/features/eventLogging/client';
import { store } from 'src/pages/createStore';

import App from './App';
import { initializeAgGridModules } from './bootstrap/agGrid';
import { initializeSentryLogging } from './bootstrap/sentry';
import { createInBrowserFileSystem } from './pages/fileSystem/createInBrowserFileSystem';

SyntaxHighlighter.registerLanguage('javascript', javascript);

initializeSentryLogging();
initializeAgGridModules();

const rootContainer = document.getElementById('root') as HTMLElement;
const root = createRoot(rootContainer);
(window as any).__REDUX_STORE__ = store; // need this for slang's display
console.log(
  `%cSource Academy ${Constants.sourceAcademyEnvironment}-${Constants.sourceAcademyVersion}; ` +
    `Please visit ${Links.githubIssues} to report bugs or issues.`,
  'font-weight: bold;',
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
          <App />
        </OverlaysProvider>
      </Provider>,
    );
  });

if (process.env.NODE_ENV === 'production') {
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
        0,
      );
    },
  });
} else {
  // In development we never want a service worker: a stale one (from a production build or earlier
  // visit) serves the cached app shell for every request, so fetched evaluator/worker scripts come
  // back as `index.html` and Conductor runs hang. Proactively unregister any SW and clear its
  // caches on every dev load so this self-heals and never recurs.
  unregisterServiceWorker();
}

if (Constants.cadetLoggerUrl) {
  // Seriously: registerServiceWorker onSuccess and onUpdate are separate paths.
  // Neither of them actually fire in localhost...
  const sync = () => triggerSyncLogs(store.getState().session.accessToken);
  navigator.serviceWorker.ready.then(() => {
    setInterval(sync, Constants.cadetLoggerInterval);
  });
}
