import { Button } from '@blueprintjs/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tokens } from 'src/commons/application/types/SessionTypes';
import { useSession, useTokens } from 'src/commons/utils/Hooks';
import { initRagChat, sendRagMessage } from 'src/features/ragChat/api';
import ChatbotCodeSnippet from 'src/pages/sicp/subcomponents/chatbot/ChatbotCodeSnippet';
import classes from 'src/styles/RagChatbot.module.scss';
import { v4 as uuid } from 'uuid';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type RagMessageRendererProps = {
  message: ChatMessage;
  activeSnippetId: string;
  setActiveSnippetId: (id: string) => void;
};

const RagMessageRenderer: React.FC<RagMessageRendererProps> = ({
  message,
  activeSnippetId,
  setActiveSnippetId
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : 'javascript';
          const code = String(children).replace(/\n$/, '');
          const snippetId = `${message.id}-code-${node?.position?.start.offset ?? 0}`;

          return !inline ? (
            <ChatbotCodeSnippet
              key={snippetId}
              id={snippetId}
              code={code}
              activeSnippetId={activeSnippetId}
              setActiveSnippet={setActiveSnippetId}
              language={lang}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {message.content}
    </ReactMarkdown>
  );
};

type Props = {
  isExpanded: boolean;
  toggleExpanded: () => void;
  activeSnippetId: string;
  setActiveSnippetId: (id: string) => void;
};

const createInitialMessage = (): ChatMessage => ({
  id: uuid(),
  content: 'Hi! Ask me about lectures, tutorials, recitations, or past exams!',
  role: 'assistant'
});

const createErrorMessage = (): ChatMessage => ({
  id: uuid(),
  content: 'Sorry, something went wrong. Please try again later.',
  role: 'assistant'
});

const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
  ref.current?.scrollTo({ top: ref.current?.scrollHeight });
};

const RagChatBox: React.FC<Props> = ({
  isExpanded,
  toggleExpanded,
  activeSnippetId,
  setActiveSnippetId
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage()]);
  const [userInput, setUserInput] = useState('');
  const [maxContentSize, setMaxContentSize] = useState(1000);
  const { feedbackUrl } = useSession();
  const tokens = useTokens({ throwWhenEmpty: false });

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const sendMessage = useCallback(() => {
    if (userInput.trim() === '' || !tokens.accessToken || !tokens.refreshToken) {
      return;
    }
    const authedTokens: Tokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
    setUserInput('');
    setMessages(prev => [...prev, { id: uuid(), role: 'user', content: userInput }]);
    setIsLoading(true);

    sendRagMessage(authedTokens, userInput)
      .then(resp => {
        setMessages(prev => [...prev, { id: uuid(), role: 'assistant', content: resp.response }]);
      })
      .catch(() => {
        setMessages(prev => [...prev, createErrorMessage()]);
      })
      .finally(() => setIsLoading(false));
  }, [tokens, userInput]);

  const keyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key === 'Enter' && !isLoading) {
        sendMessage();
      }
    },
    [isLoading, sendMessage]
  );

  const resetChat = useCallback(() => {
    if (!tokens.accessToken || !tokens.refreshToken) return;
    const authedTokens: Tokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };

    initRagChat(authedTokens)
      .then(resp => {
        const conversationMessages = resp.messages;
        const maxMessageSize = resp.maxContentSize;
        if (conversationMessages && conversationMessages.length > 0) {
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
      })
      .catch(() => {
        setMessages([createInitialMessage()]);
      });
  }, [tokens]);

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
        {feedbackUrl && (
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={classes['feedback-link']}
          >
            Any feedback?
          </a>
        )}
      </div>
      <div className={classes['chat-message']} ref={chatRef}>
        {messages.map(message => (
          <div key={message.id} className={classes[`${message.role}`]}>
            {message.role === 'assistant' ? (
              <RagMessageRenderer
                message={message}
                activeSnippetId={activeSnippetId}
                setActiveSnippetId={setActiveSnippetId}
              />
            ) : (
              message.content
            )}
          </div>
        ))}
        {isLoading && <p>loading...</p>}
      </div>
      <div className={classes['control-container']}>
        <input
          type="text"
          disabled={isLoading}
          className={classes['user-input']}
          placeholder={isLoading ? 'Waiting for response...' : 'Ask Pixel anything...'}
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

export default RagChatBox;
