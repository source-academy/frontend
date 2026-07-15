import { Fragment } from 'react';
import type { RenderMessageContext } from 'src/components/ui/chatbot/ChatBox';
import type { ChatMessage } from 'src/components/ui/chatbot/types';

import ChatbotCodeSnippet from './ChatbotCodeSnippet';

/**
 * Message renderer component that can render code blocks with interactive snippets.
 */
function SicpMessageRenderer(message: ChatMessage, ctx: RenderMessageContext) {
  const { activeSnippetId, setActiveSnippetId } = ctx;
  const content = message.content;
  const messageId = message.id;

  // Matches code blocks: ```lang ... ```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let codeBlockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(
        <div key={`${messageId}-text-${lastIndex}`} style={{ marginBottom: '0.5em' }}>
          {text.split('\n').map((line, i) => (
            <Fragment key={i}>
              {line}
              <br />
            </Fragment>
          ))}
        </div>,
      );
    }

    const lang = match[1] || 'javascript';
    const code = match[2];
    // Create a unique ID for this code snippet
    const snippetId = `${messageId}-code-${codeBlockIndex}`;
    codeBlockIndex++;

    // Only use ChatbotCodeSnippet for javascript/js code blocks
    if (lang === 'javascript' || lang === 'js') {
      parts.push(
        <ChatbotCodeSnippet
          key={snippetId}
          id={snippetId}
          code={code}
          activeSnippetId={activeSnippetId}
          setActiveSnippet={setActiveSnippetId}
          language={lang}
        />,
      );
    } else {
      // For other languages, just show syntax highlighting without run capability
      parts.push(
        <div
          key={snippetId}
          className="chatbot-code-block-static"
          style={{
            margin: '0.5em 0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <ChatbotCodeSnippet
            key={snippetId}
            id={snippetId}
            code={code}
            activeSnippetId={activeSnippetId}
            setActiveSnippet={setActiveSnippetId}
            language={lang}
          />
        </div>,
      );
    }

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    parts.push(
      <div key={`${messageId}-text-end`} style={{ marginBottom: '0.5em' }}>
        {text.split('\n').map((line, i) => (
          <Fragment key={i}>
            {line}
            <br />
          </Fragment>
        ))}
      </div>,
    );
  }

  return parts;
}

export default SicpMessageRenderer;
