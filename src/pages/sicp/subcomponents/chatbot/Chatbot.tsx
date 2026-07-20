import { useCallback } from 'react';
import logo from 'src/assets/SA.jpg';
import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { useSession } from 'src/commons/utils/Hooks';
import ChatBox from 'src/components/ui/chatbot/ChatBox';
import FloatingChatbot from 'src/components/ui/chatbot/FloatingChatbot';
import { continueChat, initChat } from 'src/features/sicp/chatCompletion/api';
import type { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';

import SicpMessageRenderer from './SicpMessageRenderer';

type Props = {
  getSection: () => SicpSection;
  getText: () => string;
};

function Chatbot({ getSection, getText }: Props) {
  const { louisChatbotPrompt } = useSession();

  const init = useCallback(
    (tokens: Tokens) => initChat(tokens, louisChatbotPrompt || ''),
    [louisChatbotPrompt],
  );

  const send = useCallback(
    (tokens: Tokens, userInput: string) =>
      continueChat(tokens, userInput, getSection(), getText(), louisChatbotPrompt || ''),
    [getSection, getText, louisChatbotPrompt],
  );

  return (
    <FloatingChatbot
      avatarSrc={logo}
      avatarAlt="SA Logo"
      introMessage="I am Louis, your SICP bot"
      defaultTipsMessage="You can click me for a chat"
    >
      {({ activeSnippetId, setActiveSnippetId, isExpanded, toggleExpanded }) => (
        <ChatBox
          activeSnippetId={activeSnippetId}
          setActiveSnippetId={setActiveSnippetId}
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
          initChat={init}
          sendMessage={send}
          initialMessage="Ask me something about this paragraph!"
          errorMessage="Sorry, I am down with a cold, please try again later."
          inputPlaceholder="Type your message here..."
          renderMessage={SicpMessageRenderer}
        />
      )}
    </FloatingChatbot>
  );
}

export default Chatbot;
