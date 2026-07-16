import disableDevtool from 'disable-devtool';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import { useLocalStorageState } from 'src/commons/hooks/useLocalStorageState';
import { useOrientationChangeHandler } from 'src/commons/hooks/useOrientationChangeHandler';
import { PauseAcademyOverlay } from 'src/commons/pauseAcademyOverlay/PauseAcademyOverlay';
import { useAppDispatch } from 'src/commons/utils/Hooks';
import Messages, {
  type MessageType,
  MessageTypeNames,
  sendToWebview,
} from 'src/features/vscode/messages';

import SessionActions from '../commons/application/actions/SessionActions';
import VscodeActions from '../commons/application/actions/VscodeActions';
import NavigationBar from '../commons/navigationBar/NavigationBar';
import Constants from '../commons/utils/Constants';
import { useSession } from '../commons/utils/Hooks';
import WorkspaceActions from '../commons/workspace/WorkspaceActions';
import {
  defaultWorkspaceSettings,
  WorkspaceSettingsContext,
} from '../commons/WorkspaceSettingsContext';
import { showDangerMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';

function RootLayout() {
  const dispatch = useAppDispatch();
  const { isLoggedIn, isPaused, enableExamMode } = useSession();

  const [workspaceSettings, setWorkspaceSettings] = useLocalStorageState(
    Constants.workspaceSettingsLocalStorageKey,
    defaultWorkspaceSettings,
  );

  // Used for dev tools detection
  const [isPreviewExamMode] = useLocalStorageState(
    Constants.isPreviewExamModeLocalStorageKey,
    false,
  );
  const [pauseAcademy, setPauseAcademy] = useState(false);
  const [pauseAcademyReason, setPauseAcademyReason] = useState('');
  const hasSentPauseUserRequest = React.useRef<boolean>(false);
  const { role } = useSession();

  // Effect to fetch the latest user info and course configurations from the backend on refresh,
  // if the user was previously logged in
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(SessionActions.fetchUserAndCourse());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useOrientationChangeHandler();

  // Effect to handle messages from VS Code
  useEffect(() => {
    if (!window.confirm) {
      // Polyfill confirm() to instead show as VS Code notification
      // TODO: Pass text as a new Message to the webview
      window.confirm = text => {
        console.log(`Confirmation automatically accepted: ${text ?? 'No text provided'}`);
        return true;
      };
    }

    const message = Messages.ExtensionPing(window.origin);
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
                refreshToken: token.refreshToken,
              }),
            );
            dispatch(SessionActions.fetchUserAndCourse());
          }
          break;
        case MessageTypeNames.Text: {
          const { workspaceLocation, code } = message;
          console.log(`FRONTEND: TextMessage: ${code}`);
          dispatch(WorkspaceActions.updateEditorValue(workspaceLocation, 0, code));
          break;
        }
        case MessageTypeNames.EvalEditor:
          dispatch(WorkspaceActions.evalEditor(message.workspaceLocation));
          break;
        case MessageTypeNames.Navigate:
          window.location.pathname = message.route;
          // TODO: Figure out why this doesn't work, this is faster in theory
          // navigate(message.route);
          break;
        case MessageTypeNames.McqQuestion:
          dispatch(WorkspaceActions.showMcqPane(message.workspaceLocation, message.options));
          break;
        case MessageTypeNames.McqAnswer:
          console.log(`FRONTEND: MCQAnswerMessage: ${message}`);
          dispatch(SessionActions.submitAnswer(message.questionId, message.choice));
          break;
        case MessageTypeNames.AssessmentAnswer:
          dispatch(SessionActions.submitAnswer(message.questionId, message.answer));
          break;
        case MessageTypeNames.SetEditorBreakpoints:
          dispatch(
            WorkspaceActions.setEditorBreakpoint(
              message.workspaceLocation,
              0,
              message.newBreakpoints,
            ),
          );
          break;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for dev tools blocking/detection when exam mode enabled
  useEffect(() => {
    if (role !== Role.Student && !isPreviewExamMode) {
      return;
    }

    const showPauseAcademyOverlay = (reason: string) => {
      setPauseAcademy(true);
      setPauseAcademyReason(reason);
      if (hasSentPauseUserRequest.current === false) {
        dispatch(SessionActions.pauseUser());
        hasSentPauseUserRequest.current = true;
      }
    };

    if (enableExamMode || isPreviewExamMode) {
      dispatch(SessionActions.reportFocusRegain());

      if (isPaused !== undefined && isPaused) {
        showPauseAcademyOverlay('Browser was refreshed when Source Academy was paused');
      } else {
        hasSentPauseUserRequest.current = false;
      }

      // Disable/Detect dev tools
      disableDevtool({
        ondevtoolopen: () => {
          showPauseAcademyOverlay('Developer tools detected');
        },
      });

      document.addEventListener('contextmenu', event => event.preventDefault());
      document.addEventListener('keydown', event => {
        if (
          event.key === 'F12' ||
          ((event.key === 'I' || event.key === 'J' || event.key === 'C') &&
            event.ctrlKey &&
            event.shiftKey)
        ) {
          event.preventDefault();
        }
      });

      // Detect when Source Academy tab's content are hidden (e.g., user changes tab while Source Academy is active)
      document.addEventListener('visibilitychange', _ => {
        if (document.visibilityState === 'hidden') {
          dispatch(SessionActions.reportFocusLost());
        } else {
          showDangerMessage('Source Academy was out of focus.', 5000);
          dispatch(SessionActions.reportFocusRegain());
        }
      });
    }
  }, [dispatch, enableExamMode, isPaused, hasSentPauseUserRequest, role, isPreviewExamMode]);

  const resumeCodeSubmitHandler = (resumeCode: string) => {
    if (!resumeCode || resumeCode.length === 0) {
      showWarningMessage('Resume code cannot be empty.');
    } else {
      dispatch(
        SessionActions.validateResumeCode(resumeCode, (isResumeCodeValid: boolean) => {
          if (isResumeCodeValid) {
            setPauseAcademy(false);
            hasSentPauseUserRequest.current = false;
          } else {
            showWarningMessage('Resume code is invalid.');
          }
        }),
      );
    }
  };

  return (
    <WorkspaceSettingsContext.Provider value={[workspaceSettings, setWorkspaceSettings]}>
      {pauseAcademy ? (
        <PauseAcademyOverlay reason={pauseAcademyReason} onSubmit={resumeCodeSubmitHandler} />
      ) : (
        <div className="Application">
          <NavigationBar />
          <div className="Application__main">
            <Outlet />
          </div>
        </div>
      )}
    </WorkspaceSettingsContext.Provider>
  );
}

export const Component = RootLayout;
