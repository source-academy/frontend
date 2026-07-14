import pixelLogo from 'src/assets/pixel.jpg';
import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { useSession } from 'src/commons/utils/Hooks';
import ChatBox from 'src/components/ui/chatbot/ChatBox';
import FloatingChatbot from 'src/components/ui/chatbot/FloatingChatbot';
import { initRagChat, sendRagMessage } from 'src/features/ragChat/api';

import RagMessageRenderer from './RagMessageRenderer';

function RagChatbot() {
  const { feedbackUrl } = useSession();
  const init = (tokens: Tokens) => initRagChat(tokens);
  const send = (tokens: Tokens, userInput: string) => sendRagMessage(tokens, userInput);

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
