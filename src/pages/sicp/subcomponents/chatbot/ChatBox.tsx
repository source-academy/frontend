import { Button } from '@blueprintjs/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTokens } from 'src/commons/utils/Hooks';
import { continueChat, initChat } from 'src/features/sicp/chatCompletion/api';
import { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import classes from 'src/styles/Chatbot.module.scss';
import { v4 as uuid } from 'uuid';

import ChatbotCodeSnippet from './ChatbotCodeSnippet';

type Props = {
  getSection: () => SicpSection;
  getText: () => string;
  activeSnippetId: string;
  setActiveSnippetId: (id: string) => void;
  isExpanded: boolean;
  toggleExpanded: () => void;
};

const createInitialMessage = (): ChatMessage => ({
  id: uuid(),
  content: 'Ask me something about this paragraph!',
  role: 'assistant'
});

const createErrorMessage = (): ChatMessage => ({
  id: uuid(),
  content: 'Sorry, I am down with a cold, please try again later.',
  role: 'assistant'
});

const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollTo({ top: ref.current?.scrollHeight });
};

const ChatBox: React.FC<Props> = ({
  getSection,
  getText,
  activeSnippetId,
  setActiveSnippetId,
  isExpanded,
  toggleExpanded
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage()]);
  const [userInput, setUserInput] = useState('');
  const [maxContentSize, setMaxContentSize] = useState(1000);
  const tokens = useTokens();

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  // sendMessage sends section + text with every message
  const sendMessage = useCallback(() => {
    if (userInput.trim() === '') {
      return;
    }
    setUserInput('');
    setMessages(prev => [...prev, { id: uuid(), role: 'user', content: userInput }]);
    setIsLoading(true);

    // Get FRESH section and text at send time!
    const currentSection = getSection();
    const currentText = getText();

    // No chatId needed - backend identifies conversation by user
    continueChat(tokens, userInput, currentSection, currentText)
      .then(resp => {
        setMessages(prev => [...prev, { id: uuid(), role: 'assistant', content: resp.response }]);
      })
      .catch(() => {
        setMessages(prev => [...prev, createErrorMessage()]);
      })
      .finally(() => setIsLoading(false));
  }, [tokens, userInput, getSection, getText]);

  const keyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key === 'Enter' && !isLoading) {
        sendMessage();
      }
    },
    [isLoading, sendMessage]
  );

  const resetChat = useCallback(() => {
    initChat(tokens).then(resp => {
      const conversationMessages = resp.messages;
      const maxMessageSize = resp.maxContentSize;
      // Load all previous messages from the conversation, or use initial if empty
      if (conversationMessages && conversationMessages.length > 0) {
        // Ensure all messages have IDs (backend may not provide them)
        const messagesWithIds = conversationMessages.map(msg => ({
          ...msg,
          id: msg.id || uuid()
        }));
        setMessages(messagesWithIds);
      } else {
        setMessages([createInitialMessage()]);
      }
      setMaxContentSize(maxMessageSize);
      setUserInput('');
    });
  }, [tokens]);

  // Run once when component is mounted
  useEffect(() => {
    resetChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom(chatRef);
  }, [messages, isLoading]);

  return (
    <div
      className={`${classes['chat-container']} ${isExpanded ? classes['chat-container-expanded'] : ''}`}
    >
      <div className={classes['chat-header']}>
        <Button
          size="small"
          variant="minimal"
          icon={isExpanded ? 'minimize' : 'maximize'}
          onClick={toggleExpanded}
          title={isExpanded ? 'Shrink chat' : 'Expand chat'}
          className={classes['expand-button']}
        />
      </div>
      <div className={classes['chat-message']} ref={chatRef}>
        {messages.map(message => (
          <div
            key={message.id}
            className={classes[`${message.role}`]}
            style={{ whiteSpace: 'pre-line' }}
          >
            <MessageRenderer
              message={message}
              activeSnippetId={activeSnippetId}
              setActiveSnippetId={setActiveSnippetId}
            />
          </div>
        ))}
        {isLoading && <p>loading...</p>}
      </div>
      <div className={classes['control-container']}>
        <input
          type="text"
          disabled={isLoading}
          className={classes['user-input']}
          placeholder={isLoading ? 'Waiting for response...' : 'Type your message here...'}
          value={userInput}
          onChange={handleUserInput}
          onKeyDown={keyDown}
          maxLength={maxContentSize}
        />
        <div className={classes['input-count-container']}>
          <div className={classes['input-count']}>{`${userInput.length}/${maxContentSize}`}</div>
        </div>

        <div className={classes['button-container']}>
          <Button disabled={isLoading} className={classes['button-send']} onClick={sendMessage}>
            Send
          </Button>
          <Button className={classes['button-clean']} onClick={resetChat}>
            Clean
          </Button>
        </div>
      </div>
    </div>
  );
};

// Message renderer component that can render code blocks with interactive snippets
type MessageRendererProps = {
  message: ChatMessage;
  activeSnippetId: string;
  setActiveSnippetId: (id: string) => void;
};

const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  activeSnippetId,
  setActiveSnippetId
}) => {
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
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
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
        />
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
            overflow: 'hidden'
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
        </div>
      );
    }

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    parts.push(
      <div key={`${messageId}-text-end`} style={{ marginBottom: '0.5em' }}>
        {text.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </div>
    );
  }

  return parts;
};

export default ChatBox;
