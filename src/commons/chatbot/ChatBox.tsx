import { Buffer as NodeBuffer } from 'buffer';
import { ChatGPTAPI } from 'chatgpt';
import * as React from 'react';

import Constants from '../utils/Constants';

Buffer.from('anything', 'base64');

if (!(window as any).Buffer) {
  (window as any).Buffer = NodeBuffer;
}

const ChatBox: React.FC = () => {
  const chatRef = React.useRef<HTMLDivElement | null>(null);
  const key = Constants.chatGptKey;
  const [messages, setMessages] = React.useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [userInput, setUserInput] = React.useState<string>('');
  const [temp, setTemp] = React.useState<string>('');
  const [conversation, setConversation] = React.useState<string>('');
  const [history, setHistory] = React.useState<string>('');

  const api = new ChatGPTAPI({
    apiKey: key,
    fetch: window.fetch.bind(window)
  });

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const sendMessage = () => {
    if (userInput.trim() !== '') {
      setMessages([...messages, { text: userInput, sender: 'user' }]);
      const newConversation =
        'The following is the history. You do not need to respond.\n' +
        history +
        'you only need to response this query:\n' +
        userInput;
      setHistory(his => `${his}\n${userInput}`);
      setConversation(newConversation);
      setUserInput('');
    }
  };

  const cleanMessage = () => {
    setMessages([]);
    setHistory('');
  };

  React.useEffect(() => {
    if (conversation.trim() !== '') {
      getResponse(conversation);
    }
  }, [conversation]);

  const getResponse = async (userInput: string) => {
    try {
      const response = await api.sendMessage(userInput);
      setTemp(response.text);
    } catch (error) {
      setMessages([...messages, { text: `Error: ${error.message}`, sender: 'bot' }]);
    }
  };

  React.useEffect(() => {
    setMessages([...messages, { text: temp, sender: 'bot' }]);
  }, [temp]);

  const keyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatRef.current?.scrollTo({ top: chatRef.current?.scrollHeight });
  };

  return (
    <div className="chat-container">
      <div className="chat-message" ref={chatRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-text">
              {message.text}
              <hr />
            </div>
          </div>
        ))}
      </div>
      <input
        type="text"
        id="user-input"
        placeholder="Type your message here..."
        value={userInput}
        onChange={handleUserInput}
        onKeyDown={keyDown}
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={cleanMessage}>Clean</button>
    </div>
  );
};

export default ChatBox;
