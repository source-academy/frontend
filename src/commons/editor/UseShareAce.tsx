import '@convergencelabs/ace-collab-ext/dist/css/ace-collab-ext.css';

import { AceMultiCursorManager } from '@convergencelabs/ace-collab-ext';
import * as Sentry from '@sentry/browser';
import sharedbAce from '@sourceacademy/sharedb-ace';
import React, { useMemo } from 'react';

import { getDocInfoFromSessionId, getSessionUrl } from '../collabEditing/CollabEditingHelper';
import { useSession } from '../utils/Hooks';
import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';
import { EditorHook } from './Editor';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useShareAce: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  // use a ref to refer to any other props so that we run the effect below
  // *only* when the editorSessionId changes
  const propsRef = React.useRef(inProps);
  propsRef.current = inProps;

  const { editorSessionId, sessionDetails } = inProps;

  const { name } = useSession();

  const user = useMemo(() => ({ name, color: getColor() }), [name]);

  React.useEffect(() => {
    if (!editorSessionId || !sessionDetails) {
      return;
    }

    const editor = reactAceRef.current!.editor;
    const cursorManager = new AceMultiCursorManager(editor.getSession());
    const ShareAce = new sharedbAce(sessionDetails.docId, {
      user,
      cursorManager,
      WsUrl: getSessionUrl(editorSessionId, true),
      pluginWsUrl: null,
      namespace: 'sa'
    });

    ShareAce.on('ready', () => {
      ShareAce.add(editor, cursorManager, ['contents'], []);
      propsRef.current.handleSetSharedbConnected!(true);

      // Disables editor in a read-only session
      editor.setReadOnly(sessionDetails.readOnly);

      showSuccessMessage(
        'You have joined a session as ' + (sessionDetails.readOnly ? 'a viewer.' : 'an editor.')
      );
    });
    ShareAce.on('error', (path: string, error: any) => {
      console.error('ShareAce error', error);
      Sentry.captureException(error);
    });

    // WebSocket connection status detection logic
    const WS = ShareAce.WS;
    // Since interval is used as a closure.
    // eslint-disable-next-line prefer-const
    let interval: any;
    const checkStatus = async () => {
      if (ShareAce === null) {
        return;
      }
      try {
        const docInfo = await getDocInfoFromSessionId(editorSessionId);
        if (docInfo === null) {
          clearInterval(interval);
          WS.close();
        }
      } catch {
        WS.reconnect();
      }
    };
    // Checks connection status every 5sec
    interval = setInterval(checkStatus, 5000);

    WS.addEventListener('open', () => {
      propsRef.current.handleSetSharedbConnected!(true);
    });
    WS.addEventListener('close', () => {
      propsRef.current.handleSetSharedbConnected!(false);
    });

    return () => {
      clearInterval(interval);
      for (const connection of Object.values<any>(ShareAce.connections)) {
        connection.unlisten();
      }
      ShareAce.WS.close();

      // Resets editor to normal after leaving the session
      editor.setReadOnly(false);

      // Removes all cursors
      cursorManager.removeAll();
    };
  }, [editorSessionId, sessionDetails, reactAceRef, user]);
};

function getColor() {
  return (
    'hsl(' +
    360 * Math.random() +
    ',' +
    (25 + 70 * Math.random()) +
    '%,' +
    (50 + 20 * Math.random()) +
    '%)'
  );
}

export default useShareAce;
