import * as React from 'react';
import sharedbAce from 'sharedb-ace';

import { checkSessionIdExists } from '../collabEditing/CollabEditingHelper';
import { Links } from '../utils/Constants';
import { EditorHook } from './Editor';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useShareAce: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  // editorValue is the prop that is going to change all the time
  // use a ref so that the callbacks below can be memoised
  const editorValueRef = React.useRef<string>(inProps.editorValue);
  React.useEffect(() => {
    editorValueRef.current = inProps.editorValue;
  }, [inProps.editorValue]);

  const {
    editorSessionId,
    sharedbAceIsInviting,
    handleEditorValueChange,
    handleFinishInvite,
    sharedbAceInitValue,
    handleSetWebsocketStatus
  } = inProps;

  const handleStartCollabEditing = React.useCallback(() => {
    const editor = reactAceRef.current!.editor;
    const ShareAce = new sharedbAce(editorSessionId, {
      WsUrl: 'wss://' + Links.shareDBServer + 'ws/',
      pluginWsUrl: null,
      namespace: 'codepad'
    });
    ShareAce.on('ready', () => {
      ShareAce.add(
        editor,
        ['code'],
        [
          // TODO: Removal
          // SharedbAceRWControl,
          // SharedbAceMultipleCursors
        ]
      );
      if (sharedbAceIsInviting) {
        handleEditorValueChange(sharedbAceInitValue!);
        handleFinishInvite!();
      }
    });

    // WebSocket connection status detection logic
    const WS = ShareAce.WS;
    // Since interval is used as a closure.
    // eslint-disable-next-line prefer-const
    let interval: any;
    const sessionIdNotFound = () => {
      clearInterval(interval);
      WS.close();
    };
    const cannotReachServer = () => {
      WS.reconnect();
    };
    const checkStatus = () => {
      if (ShareAce === null) {
        return;
      }
      checkSessionIdExists(editorSessionId, () => {}, sessionIdNotFound, cannotReachServer);
    };
    // Checks connection status every 5sec
    interval = setInterval(checkStatus, 5000);

    WS.addEventListener('open', (event: Event) => {
      handleSetWebsocketStatus!(1);
    });
    WS.addEventListener('close', (event: Event) => {
      handleSetWebsocketStatus!(0);
    });
    return ShareAce;
  }, [
    reactAceRef,
    editorSessionId,
    handleEditorValueChange,
    handleSetWebsocketStatus,
    handleFinishInvite,
    sharedbAceInitValue,
    sharedbAceIsInviting
  ]);

  React.useEffect(() => {
    const shareAce = editorSessionId !== '' ? handleStartCollabEditing() : null;
    return () => {
      // Terminates the session if it exists.
      // Assumes editorSessionId is immutable.
      if (shareAce) {
        shareAce.WS.close();
      }
    };
  }, [handleStartCollabEditing, reactAceRef, editorSessionId]);
};

export default useShareAce;
