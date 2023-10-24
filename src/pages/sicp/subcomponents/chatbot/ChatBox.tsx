import { Buffer as NodeBuffer } from 'buffer';
import { ChatGPTAPI } from 'chatgpt';
import { useMemo } from 'react';
import * as React from 'react';
import Constants from 'src/commons/utils/Constants';

Buffer.from('anything', 'base64');

if (!(window as any).Buffer) {
  (window as any).Buffer = NodeBuffer;
}

const ChatBox: React.FC = () => {
  const chatRef = React.useRef<HTMLDivElement | null>(null);
  const key = Constants.chatGptKey;
  const [messages, setMessages] = React.useState<{ text: string; sender: 'user' | 'bot' }[]>([
    { text: 'Ask me something about this charpter!', sender: 'bot' }
  ]);
  const [userInput, setUserInput] = React.useState<string>('');
  const [temp, setTemp] = React.useState<string>('');
  const [conversation, setConversation] = React.useState<string>('');
  const [history, setHistory] = React.useState<string>('');

  const api = useMemo(() => {
    return new ChatGPTAPI({
      apiKey: key,
      fetch: window.fetch.bind(window)
    });
  }, [key]);

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const sendMessage = () => {
    if (userInput.trim() !== '') {
      setMessages([...messages, { text: userInput, sender: 'user' }]);
      const newConversation =
        'The following questions are about SICP JS. If it is not must not answer!' +
        'Please answer the questions based on this book \n' +
        'The following is the history. DO NOT answer the following queries.\n' +
        history +
        '\nThe only query you need to response is this:\n' +
        userInput;
      setHistory(his => `${his}\n${userInput}`);
      setConversation(newConversation);
      setUserInput('');
    }
  };

  const cleanMessage = () => {
    setMessages([{ text: 'Ask me something about this charpter!', sender: 'bot' }]);
    setHistory('');
  };

  React.useEffect(() => {
    const getResponse = async (userInput: string) => {
      try {
        const response = await api.sendMessage(userInput);
        setTemp(response.text);
      } catch (error) {
        setMessages([...messages, { text: `Error: ${error.message}`, sender: 'bot' }]);
      }
    };

    if (conversation.trim() !== '') {
      getResponse(conversation);
    }
  }, [conversation, api, messages, setTemp, setMessages]);

  React.useEffect(() => {
    if (temp.trim() !== '') {
      setMessages([...messages, { text: temp, sender: 'bot' }]);
    }
  }, [temp, messages, setMessages]);

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
            {message.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        className="user-input"
        placeholder="Type your message here..."
        value={userInput}
        onChange={handleUserInput}
        onKeyDown={keyDown}
      />
      <div className="button-container">
        <button className="button-send" onClick={sendMessage}>
          Send
        </button>
        <button className="button-clean" onClick={cleanMessage}>
          Clean
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
