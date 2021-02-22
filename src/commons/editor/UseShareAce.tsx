import * as Sentry from '@sentry/browser';
import sharedbAce from '@sourceacademy/sharedb-ace';
import * as React from 'react';

import { checkSessionIdExists, getSessionUrl } from '../collabEditing/CollabEditingHelper';
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

  const { editorSessionId } = inProps;

  React.useEffect(() => {
    if (!editorSessionId) {
      return;
    }

    const editor = reactAceRef.current!.editor;
    const ShareAce = new sharedbAce(editorSessionId, {
      WsUrl: getSessionUrl(editorSessionId, true),
      pluginWsUrl: null,
      namespace: 'sa'
    });
    ShareAce.on('ready', () => {
      ShareAce.add(editor, [], []);
      propsRef.current.handleSetSharedbConnected!(true);
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
        const exists = await checkSessionIdExists(editorSessionId);
        if (!exists) {
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
    };
  }, [editorSessionId, reactAceRef]);
};

export default useShareAce;
