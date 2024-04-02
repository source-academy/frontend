import * as Sentry from '@sentry/browser';
import sharedbAce from '@sourceacademy/sharedb-ace';
import { Ace } from 'ace-builds';
import React from 'react';

import { getDocInfoFromSessionId, getSessionUrl } from '../collabEditing/CollabEditingHelper';
import { useTypedSelector } from '../utils/Hooks';
import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';
import AceMultiCursorManager from './AceMultiCursorManager';
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

  const user = {
    name: useTypedSelector(state => state.session.name),
    color: '#5f9ea0' // TODO: random generator
  }

  React.useEffect(() => {
    if (!editorSessionId || !sessionDetails) {
      return;
    }

    const editor = reactAceRef.current!.editor;
    const ShareAce = new sharedbAce(sessionDetails.docId, {
      user,
      WsUrl: getSessionUrl(editorSessionId, true),
      pluginWsUrl: null,
      namespace: 'sa'
    });

    ShareAce.on('ready', () => {
      ShareAce.add(editor, ['contents'], []);
      propsRef.current.handleSetSharedbConnected!(true);

      // Disables editor in a read-only session
      editor.setReadOnly(sessionDetails.readOnly);

      const curMgr = new AceMultiCursorManager(editor.getSession());

      ShareAce.connections.contents.on('userPresenceUpdate', (id: string, newPresence: { user: any, cursorPos: Ace.Point }) => {
        // TODO: modify this and move it to a separate handler
        // when more info is added to presence
        try {
          curMgr.addCursor(id, newPresence.user.name, newPresence.user.color, newPresence.cursorPos);
        } catch (err) {
          curMgr.setCursor(id, newPresence.cursorPos);
        }
      });

      ShareAce.connections.contents.on('userLeft', (id: string) => {
        curMgr.removeCursor(id);
      })

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
    };
    // eslint-disable-next-line
  }, [editorSessionId, sessionDetails, reactAceRef]);
};

export default useShareAce;
