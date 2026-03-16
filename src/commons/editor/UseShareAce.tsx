import '@convergencelabs/ace-collab-ext/dist/css/ace-collab-ext.css';

import {
  AceMultiCursorManager,
  AceMultiSelectionManager,
  AceRadarView
} from '@convergencelabs/ace-collab-ext';
import * as Sentry from '@sentry/react';
import sharedbAce from '@sourceacademy/sharedb-ace';
import type SharedbAceBinding from '@sourceacademy/sharedb-ace/binding';
import { CollabEditingAccess } from '@sourceacademy/sharedb-ace/types';
import React from 'react';
import { useDispatch } from 'react-redux';

import { getLanguageConfig } from '../application/ApplicationTypes';
import CollabEditingActions from '../collabEditing/CollabEditingActions';
import { getDocInfoFromSessionId, getSessionUrl } from '../collabEditing/CollabEditingHelper';
import { parseModeString } from '../utils/AceHelper';
import { useSession } from '../utils/Hooks';
import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';
import { EditorHook } from './Editor';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const color = getColor();

const useShareAce: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  // use a ref to refer to any other props so that we run the effect below
  // *only* when the editorSessionId or sessionDetails changes
  const propsRef = React.useRef(inProps);
  propsRef.current = inProps;

  const { editorSessionId, sessionDetails } = inProps;
  const { name, userId } = useSession();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!editorSessionId || !sessionDetails) {
      return;
    }

    const collabEditorAccess = sessionDetails.owner
      ? CollabEditingAccess.OWNER
      : sessionDetails.readOnly
        ? CollabEditingAccess.VIEWER
        : CollabEditingAccess.EDITOR;

    const user = {
      name: name || 'Unnamed user',
      color,
      role: collabEditorAccess
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

    const ShareAce = new sharedbAce(sessionDetails.docId, {
      user,
      WsUrl: getSessionUrl(editorSessionId, true),
      namespace: 'sa'
    });

    const updateUsers = (binding: SharedbAceBinding) => {
      if (binding.connectedUsers === undefined) {
        return;
      }
      propsRef.current.setUsers?.(binding.connectedUsers);
      const myUserId = Object.keys(ShareAce.usersPresence.localPresences)[0];
      if (binding.connectedUsers[myUserId].role !== user.role) {
        // Change in role, update readOnly status in sessionDetails
        dispatch(
          CollabEditingActions.setSessionDetails('playground', {
            readOnly: binding.connectedUsers[myUserId].role === CollabEditingAccess.VIEWER
          })
        );
      }
    };

    const shareAceReady = () => {
      if (!sessionDetails) {
        return;
      }
      const binding = ShareAce.add(
        editor,
        ['contents'],
        {
          cursorManager,
          selectionManager,
          radarManager
        },
        {
          languageSelectHandler: (language: string) => {
            const { chapter, variant } = parseModeString(language);
            propsRef.current.updateLanguageCallback?.(getLanguageConfig(chapter, variant), null);
          }
        }
      );
      propsRef.current.handleSetSharedbConnected!(true);
      dispatch(
        CollabEditingActions.setUpdateUserRoleCallback('playground', binding.changeUserRole)
      );

      // Disables editor in a read-only session
      editor.setReadOnly(sessionDetails.readOnly);
      navigator.clipboard.writeText(editorSessionId).then(() => {
        showSuccessMessage(
          `You have joined a session as ${sessionDetails.readOnly ? 'a viewer' : 'an editor'}. Copied to clipboard: ${editorSessionId}`
        );
      });

      updateUsers(binding);
      binding.usersPresence.on('receive', () => updateUsers(binding));
      window.history.pushState({}, document.title, '/playground/' + editorSessionId);
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

      // Removes all cursors
      cursorManager.removeAll();

      // Removes all selections
      selectionManager.removeAll();

      // @ts-expect-error hotfix to remove all views in radarManager
      radarManager.removeAllViews();

      if (
        window.location.href.includes('/playground') &&
        !window.location.href.endsWith('/playground')
      ) {
        window.history.pushState({}, document.title, '/playground');
      }
    };
  }, [editorSessionId, sessionDetails, reactAceRef, userId, name, dispatch]);
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
