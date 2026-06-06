import logo from 'src/assets/SA.jpg';
import FloatingChatbot from 'src/components/ui/chatbot/FloatingChatbot';
import type { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';

import ChatBox from './ChatBox';

type Props = {
  getSection: () => SicpSection;
  getText: () => string;
};

function Chatbot({ getSection, getText }: Props) {
  return (
    <FloatingChatbot
      avatarSrc={logo}
      avatarAlt="SA Logo"
      introMessage="I am Louis, your SICP bot"
      defaultTipsMessage="You can click me for a chat"
    >
      {({ activeSnippetId, setActiveSnippetId, isExpanded, toggleExpanded }) => (
        <ChatBox
          getSection={getSection}
          getText={getText}
          activeSnippetId={activeSnippetId}
          setActiveSnippetId={setActiveSnippetId}
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
        />
      )}
    </FloatingChatbot>
  );
}

export default Chatbot;
