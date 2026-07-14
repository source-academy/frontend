import { Button } from '@blueprintjs/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTokens } from 'src/commons/utils/Hooks';
import { continueChat, initChat } from 'src/features/sicp/chatCompletion/api';
import type { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import { v4 as uuid } from 'uuid';

import classes from './Chatbot.module.css';
import SicpMessageRenderer from './SicpMessageRenderer';

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
  role: 'assistant',
});

const createErrorMessage = (): ChatMessage => ({
  id: uuid(),
  content: 'Sorry, I am down with a cold, please try again later.',
  role: 'assistant',
});

const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
  ref.current?.scrollTo({ top: ref.current?.scrollHeight });
};

function ChatBox({
  getSection,
  getText,
  activeSnippetId,
  setActiveSnippetId,
  isExpanded,
  toggleExpanded,
}: Props) {
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
    [isLoading, sendMessage],
  );

  const resetChat = useCallback(() => {
    initChat(tokens)
      .then(resp => {
        const conversationMessages = resp.messages;
        const maxMessageSize = resp.maxContentSize;
        if (conversationMessages && conversationMessages.length > 0) {
          const messagesWithIds = conversationMessages.map(msg => ({
            ...msg,
            id: msg.id || uuid(),
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
      <Button
        size="small"
        variant="minimal"
        icon={isExpanded ? 'minimize' : 'maximize'}
        onClick={toggleExpanded}
        title={isExpanded ? 'Shrink chat' : 'Expand chat'}
        className={classes['expand-button']}
      />
      <div className={classes['chat-message']} ref={chatRef}>
        {messages.map(message => (
          <div
            key={message.id}
            className={classes[`${message.role}`]}
            style={{ whiteSpace: 'pre-line' }}
          >
            <SicpMessageRenderer
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
}

export default ChatBox;
