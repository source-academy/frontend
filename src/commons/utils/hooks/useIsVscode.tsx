import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SessionActions from 'src/commons/application/actions/SessionActions';
import VscodeActions from 'src/commons/application/actions/VscodeActions';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import Messages, {
  MessageType,
  MessageTypeNames,
  sendToWebview
} from 'src/features/vscode/messages';

/**
 * To handle messages from VS Code.
 */
export const useIsVscode = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const originalConfirm = window.confirm;

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

    const listener = (event: MessageEvent<MessageType>) => {
      const message = event.data;
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
          const { workspaceLocation, code } = message;
          console.log(`FRONTEND: TextMessage: ${code}`);
          dispatch(WorkspaceActions.updateEditorValue(workspaceLocation, 0, code));
          break;
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
      }
    };

    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
      // Reset confirm to the original function
      window.confirm = originalConfirm;
    };
  }, [dispatch]);
};
