import { useCallback } from 'react';
import pixelLogo from 'src/assets/pixel.jpg';
import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { useAppSelector, useSession } from 'src/commons/utils/Hooks';
import ChatBox from 'src/components/ui/chatbot/ChatBox';
import FloatingChatbot from 'src/components/ui/chatbot/FloatingChatbot';
import { initRagChat, sendRagMessage } from 'src/features/ragChat/api';

import RagMessageRenderer from './RagMessageRenderer';

const init = (tokens: Tokens) => initRagChat(tokens);

type Props = {
  /** The assessment/question the user is currently viewing, if any. Supplied by the route. */
  assessmentId?: number;
  questionId?: number;
};

function RagChatbot({ assessmentId, questionId }: Props) {
  const { feedbackUrl } = useSession();
  const onAssessment = assessmentId !== undefined && questionId !== undefined;

  // Code from whichever workspace the student is currently in, plus the question they're on.
  const code = useAppSelector(state => {
    const workspace = onAssessment ? state.workspaces.assessment : state.workspaces.playground;
    return workspace.editorTabs[workspace.activeEditorTabIndex ?? 0]?.value;
  });
  const question = useAppSelector(state =>
    assessmentId !== undefined && questionId !== undefined
      ? state.session.assessments[assessmentId]?.questions[questionId]?.content
      : undefined,
  );

  const send = useCallback(
    (tokens: Tokens, userInput: string) => sendRagMessage(tokens, userInput, { code, question }),
    [code, question],
  );

  return (
    <FloatingChatbot
      avatarSrc={pixelLogo}
      avatarAlt="Pixel Logo"
      introMessage="I am Pixel, your CS1101S assistant"
      defaultTipsMessage="Click me for a chat!"
    >
      {({ activeSnippetId, setActiveSnippetId, isExpanded, toggleExpanded }) => (
        <ChatBox
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
          activeSnippetId={activeSnippetId}
          setActiveSnippetId={setActiveSnippetId}
          initChat={init}
          sendMessage={send}
          initialMessage="Hi! Ask me about lectures, tutorials, recitations, or past exams!"
          errorMessage="Sorry, something went wrong. Please try again later."
          inputPlaceholder="Ask Pixel anything..."
          renderMessage={RagMessageRenderer}
          feedbackUrl={feedbackUrl}
        />
      )}
    </FloatingChatbot>
  );
}

export default RagChatbot;
