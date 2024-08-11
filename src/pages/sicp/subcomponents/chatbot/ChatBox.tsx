import { Button } from '@blueprintjs/core';
import React, { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useTokens } from 'src/commons/utils/Hooks';
import { continueChat, initChat } from 'src/features/sicp/chatCompletion/api';
import { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import { SourceTheme } from 'src/features/sicp/SourceTheme';
import classes from 'src/styles/Chatbot.module.scss';
import { v4 as uuid } from 'uuid';

type Props = {
  getSection: () => SicpSection;
  getText: () => string;
};

const INITIAL_MESSAGE: Readonly<ChatMessage> = {
  content: 'Ask me something about this paragraph!',
  role: 'assistant'
};

const BOT_ERROR_MESSAGE: Readonly<ChatMessage> = {
  content: 'Sorry, I am down with a cold, please try again later.',
  role: 'assistant'
};

const ChatBox: React.FC<Props> = ({ getSection, getText }) => {
  const resetChat = () => {
    initChat(tokens, getSection(), getText()).then(resp => {
      const message = resp.response;
      const conversationId = resp.conversationId;
      setMessages([message]);
      setChatId(conversationId);
    });
  };
  const chatRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(uuid());
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [userInput, setUserInput] = useState('');
  const tokens = useTokens();

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const sendMessage = () => {
    if (userInput.trim() === '') {
      return;
    }
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setIsLoading(true);
    continueChat(tokens, chatId, userInput)
      .then(resp => {
        const message = resp.response;
        setMessages(prev => [...prev, { role: 'assistant', content: message }]);
      })
      .catch(() => {
        setMessages(prev => [...prev, BOT_ERROR_MESSAGE]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const keyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    chatRef.current?.scrollTo({ top: chatRef.current?.scrollHeight });
  };

  // Run once when component is mounted
  useEffect(() => {
    resetChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className={classes['chat-container']}>
      <div className={classes['chat-message']} ref={chatRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={classes[`${message.role}`]}
            style={{ whiteSpace: 'pre-line' }}
          >
            {renderMessageContent(message, index)}
          </div>
        ))}
        {isLoading && <p>loading...</p>}
      </div>
      <input
        type="text"
        disabled={isLoading}
        className={classes['user-input']}
        placeholder={isLoading ? 'Waiting for response...' : 'Type your message here...'}
        value={userInput}
        onChange={handleUserInput}
        onKeyDown={keyDown}
      />
      <div className={classes['button-container']}>
        <Button disabled={isLoading} className={classes['button-send']} onClick={sendMessage}>
          Send
        </Button>
        <Button className={classes['button-clean']} onClick={resetChat}>
          Clean
        </Button>
      </div>
    </div>
  );
};

const renderMessageContent = (message: ChatMessage, index: number) => {
  let contentToRender = message.content;
  if (message.role === 'assistant' && index > 0) {
    contentToRender += '\n\nThe answer is generated by GPT-4 and may not be correct.';
  }
  // TODO: Parse full Markdown, make snippets runnable
  if (!contentToRender.includes('```javascript')) {
    return contentToRender;
  }
  const renderableRegex = /```javascript\n([\s\S]*?)\n```/g;
  const chunks = contentToRender.split(renderableRegex);
  return chunks.map((chunk, i) => {
    return renderableRegex.test(chunk) ? (
      <SyntaxHighlighter language="javascript" style={SourceTheme} key={i}>
        {chunk}
      </SyntaxHighlighter>
    ) : (
      <React.Fragment key={i}>{chunk.trim()}</React.Fragment>
    );
  });
};

export default ChatBox;
