import React from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Messages, {
  MessageType,
  MessageTypeNames,
  sendToWebview
} from 'src/features/vscode/messages';

import NavigationBar from '../navigationBar/NavigationBar';
import Constants from '../utils/Constants';
import { useLocalStorageState, useSession } from '../utils/Hooks';
import WorkspaceActions from '../workspace/WorkspaceActions';
import { defaultWorkspaceSettings, WorkspaceSettingsContext } from '../WorkspaceSettingsContext';
import SessionActions from './actions/SessionActions';
import VscodeActions from './actions/VscodeActions';

const Application: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSession();

  // Used in the mobile/PWA experience (e.g. separate handling of orientation changes on Andriod & iOS due to unique browser behaviours)
  const isMobile = /iPhone|iPad|Android/.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches; // Checks if user is accessing from the PWA
  const browserDimensions = React.useRef({ height: 0, width: 0 });

  const [workspaceSettings, setWorkspaceSettings] = useLocalStorageState(
    Constants.workspaceSettingsLocalStorageKey,
    defaultWorkspaceSettings
  );

  // Effect to fetch the latest user info and course configurations from the backend on refresh,
  // if the user was previously logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      dispatch(SessionActions.fetchUserAndCourse());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The following effect prevents the mobile browser interface from hiding on scroll by setting the
   * application height to the window's innerHeight, even after orientation changes. This ensures that
   * the app UI does not break due to the hiding of the browser interface when the user is not on the PWA.
   *
   * Note: When the soft keyboard is up on Android devices, the viewport height decreases and triggers
   * the 'resize' event. The conditional in orientationChangeHandler checks specifically for this, and
   * does not update the application height when the Android keyboard triggers the resize event. IOS
   * devices are not affected.
   */
  React.useEffect(() => {
    const orientationChangeHandler = () => {
      if (
        !(
          window.innerHeight < browserDimensions.current.height &&
          window.innerWidth === browserDimensions.current.width
        )
      ) {
        // If it is not an Android soft keyboard triggering the resize event, update the application height.
        document.documentElement.style.setProperty(
          '--application-height',
          window.innerHeight + 'px'
        );
      }
      browserDimensions.current = { height: window.innerHeight, width: window.innerWidth };
    };

    if (!isPWA && isMobile) {
      orientationChangeHandler();
      window.addEventListener('resize', orientationChangeHandler);
    }

    return () => {
      if (!isPWA && isMobile) {
        window.removeEventListener('resize', orientationChangeHandler);
      }
    };
  }, [isPWA, isMobile]);

  // Effect to handle messages from VS Code
  React.useEffect(() => {
    if (!window.confirm) {
      // Polyfill confirm() to instead show as VS Code notification
      // TODO: Pass text as a new Message to the webview
      window.confirm = text => {
        console.log(`Confirmation automatically accepted: ${text ?? 'No text provided'}`);
        return true;
      };
    }

    const message = Messages.ExtensionPing();
    sendToWebview(message);

    window.addEventListener('message', event => {
      const message: MessageType = event.data;
      // Only accept messages from the vscode webview
      if (!event.origin.startsWith('vscode-webview://')) {
        return;
      }
      // console.log(`FRONTEND: Message from ${event.origin}: ${JSON.stringify(message)}`);
      switch (message.type) {
        case MessageTypeNames.ExtensionPong:
          console.log('Received WebviewStarted message, will set vsc');
          dispatch(VscodeActions.setVscode());

          if (message.token) {
            const token = JSON.parse(message.token.trim());
            console.log(`FRONTEND: WebviewStarted: ${token}`);
            dispatch(
              SessionActions.setTokens({
                accessToken: token.accessToken,
                refreshToken: token.refreshToken
              })
            );
            dispatch(SessionActions.fetchUserAndCourse());
          }
          break;
        case MessageTypeNames.Text:
          const code = message.code;
          console.log(`FRONTEND: TextMessage: ${code}`);
          // TODO: Don't change ace editor directly
          // const elements = document.getElementsByClassName('react-ace');
          // if (elements.length === 0) {
          //   return;
          // }
          // // @ts-expect-error: ace is not available at compile time
          // const editor = ace.edit(elements[0]);
          // editor.setValue(code);
          dispatch(WorkspaceActions.updateEditorValue('assessment', 0, code));
          break;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WorkspaceSettingsContext.Provider value={[workspaceSettings, setWorkspaceSettings]}>
      <div className="Application">
        <NavigationBar />
        <div className="Application__main">
          <Outlet />
        </div>
      </div>
    </WorkspaceSettingsContext.Provider>
  );
};

export default Application;
