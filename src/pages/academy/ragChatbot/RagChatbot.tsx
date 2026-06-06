import pixelLogo from 'src/assets/pixel.jpg';
import FloatingChatbot from 'src/components/ui/chatbot/FloatingChatbot';

import RagChatBox from './RagChatBox';

function RagChatbot() {
  return (
    <FloatingChatbot
      avatarSrc={pixelLogo}
      avatarAlt="Pixel Logo"
      introMessage="I am Pixel, your CS1101S assistant"
      defaultTipsMessage="Click me for a chat!"
    >
      {({ activeSnippetId, setActiveSnippetId, isExpanded, toggleExpanded }) => (
        <RagChatBox
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
          activeSnippetId={activeSnippetId}
          setActiveSnippetId={setActiveSnippetId}
        />
      )}
    </FloatingChatbot>
  );
}

export default RagChatbot;
