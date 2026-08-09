import { useCallback } from 'react';
import pixelLogo from 'src/assets/pixel.jpg';
import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { useAppSelector, useSession } from 'src/commons/utils/Hooks';
import ChatBox from 'src/components/ui/chatbot/ChatBox';
import FloatingChatbot from 'src/components/ui/chatbot/FloatingChatbot';
import { initRagChat, sendRagMessage } from 'src/features/ragChat/api';

import RagMessageRenderer from './RagMessageRenderer';

const init = (tokens: Tokens) => initRagChat(tokens);

function RagChatbot() {
  const { feedbackUrl } = useSession();
  const assessmentId = useAppSelector(state => state.workspaces.assessment.currentAssessment);
  const questionId = useAppSelector(state => state.workspaces.assessment.currentQuestion);
  const assessmentEditorTabs = useAppSelector(state => state.workspaces.assessment.editorTabs);
  const assessmentActiveTab = useAppSelector(
    state => state.workspaces.assessment.activeEditorTabIndex,
  );
  const assessmentQuestionContent = useAppSelector(state => {
    if (assessmentId === undefined || questionId === undefined) {
      return undefined;
    }
    return state.session.assessments[assessmentId]?.questions[questionId]?.content;
  });
  const playgroundEditorTabs = useAppSelector(state => state.workspaces.playground.editorTabs);
  const playgroundActiveTab = useAppSelector(
    state => state.workspaces.playground.activeEditorTabIndex,
  );

  const send = useCallback(
    (tokens: Tokens, userInput: string) => {
      const onAssessment = assessmentId !== undefined && questionId !== undefined;
      const code = onAssessment
        ? assessmentEditorTabs[assessmentActiveTab ?? 0]?.value
        : playgroundEditorTabs[playgroundActiveTab ?? 0]?.value;
      const question = onAssessment ? assessmentQuestionContent : undefined;

      return sendRagMessage(tokens, userInput, { code, question });
    },
    [
      assessmentId,
      questionId,
      assessmentEditorTabs,
      assessmentActiveTab,
      assessmentQuestionContent,
      playgroundEditorTabs,
      playgroundActiveTab,
    ],
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
