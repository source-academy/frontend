import '@convergencelabs/ace-collab-ext/dist/css/ace-collab-ext.css';

import {
  AceMultiCursorManager,
  AceMultiSelectionManager,
  AceRadarView
} from '@convergencelabs/ace-collab-ext';
import * as Sentry from '@sentry/browser';
import sharedbAce from '@sourceacademy/sharedb-ace';
import React, { useMemo } from 'react';

import { getDocInfoFromSessionId, getSessionUrl } from '../collabEditing/CollabEditingHelper';
import { useSession } from '../utils/Hooks';
import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';
import { EditorHook } from './Editor';

type User = {
  id: any;
  name: string;
  color: string;
};

type UsersObj = {
  [key: string]: {
    user: User;
    cursorPos: {
      row: number;
      column: number;
    };
  };
};

type LocalPresences = {
  [key: string]: {
    value: any;
  };
};

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
  const { name, userId } = useSession();

  // const { sessionDetails } = inProps;
  // const { name, userId: editorSessionId } = useSession();

  const sessionCreatorId = 0;

  // TODO: Set meaningful name here instead of simply "undefined"
  const user = useMemo(
    () => ({
      id: editorSessionId,
      userId,
      name,
      color: getColor(),
      accessLevel: userId === sessionCreatorId ? 2 : 1
    }),
    [editorSessionId, name, sessionCreatorId]
  );

  React.useEffect(() => {
    if (!editorSessionId || !sessionDetails) {
      return;
    }

    const updateUsers = () => {
      const localPresences: LocalPresences = ShareAce.usersPresence.localPresences;
      const localData = Object.values(localPresences)[0].value.user;
      let usersArray = [
        {
          id: localData.id,
          name: localData.name + ' (You)',
          color: localData.color,
          accessLevel: localData.id === sessionCreatorId ? 2 : sessionDetails.readOnly ? 0 : 1
        }
      ];
      const remotePresences: UsersObj = ShareAce.usersPresence.remotePresences;
      usersArray = [
        ...usersArray,
        ...Object.values(remotePresences).map(entry => ({
          id: entry.user.id,
          name: entry.user.name,
          color: entry.user.color,
          accessLevel:
            entry.user.id === sessionCreatorId ? 2 : entry.user.id == sessionDetails.docId ? 1 : 0,
          cursorPos: entry.cursorPos
        }))
      ];
      // console.log(ShareAce.usersPresence);
      inProps.setUsersArray(usersArray);
    };

    const editor = reactAceRef.current!.editor;
    const session = editor.getSession();
    // TODO: Hover over the indicator to show the username as well
    const cursorManager = new AceMultiCursorManager(session);
    const selectionManager = new AceMultiSelectionManager(session);
    const radarManager = new AceRadarView('ace-radar-view', editor);

    // @ts-expect-error hotfix to remove all views in radarManager
    radarManager.removeAllViews = () => {
      // @ts-expect-error hotfix to remove all views in radarManager
      for (const id in radarManager._views) {
        radarManager.removeView(id);
      }
    };

    // TODO: Figure out a deterministic way to pass a consistent ID like `userId`
    const ShareAce = new sharedbAce(sessionDetails.docId, {
      user,
      WsUrl: getSessionUrl(editorSessionId, true),
      namespace: 'sa'
    });

    const shareAceReady = () => {
      if (!sessionDetails) {
        return;
      }
      ShareAce.add(editor, ['contents'], {
        cursorManager,
        selectionManager,
        radarManager
      });
      propsRef.current.handleSetSharedbConnected!(true);

      // Disables editor in a read-only session
      editor.setReadOnly(sessionDetails.readOnly);

      showSuccessMessage(
        'You have joined a session as ' + (sessionDetails.readOnly ? 'a viewer.' : 'an editor.')
      );
    };

    const shareAceError = (path: string, error: any) => {
      console.error('ShareAce error', error);
      Sentry.captureException(error);
    };

    ShareAce.on('ready', shareAceReady);
    ShareAce.on('error', shareAceError);

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

    // TODO: clear the following event listeners
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

      ShareAce.off('ready', shareAceReady);
      ShareAce.off('error', shareAceError);

      // Resets editor to normal after leaving the session
      editor.setReadOnly(false);

      ShareAce.usersPresence.off('receive', updateUsers);

      // Removes all cursors
      cursorManager.removeAll();

      // Removes all selections
      selectionManager.removeAll();

      // @ts-expect-error hotfix to remove all views in radarManager
      radarManager.removeAllViews();
    };
  }, [editorSessionId, sessionDetails, reactAceRef, user]);

  return;
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
