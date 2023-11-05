import { Buffer as NodeBuffer } from 'buffer';
import { ChatGPTAPI } from 'chatgpt';
import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Constants from 'src/commons/utils/Constants';

Buffer.from('anything', 'base64');

if (!(window as any).Buffer) {
  (window as any).Buffer = NodeBuffer;
}

const ChatBox: React.FC = () => {
  const chatRef = React.useRef<HTMLDivElement | null>(null);
  const key = Constants.chatGptKey;
  const [messages, setMessages] = React.useState<{ text: string[]; sender: 'user' | 'bot' }[]>([ //todo: change the type fo text
    { text: ['Ask me something about this chapter!'], sender: 'bot' }
  ]);
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

  const codeBlocks = (temp:string) => { return temp.split('```');}


  const sendMessage = () => {
    if (userInput.trim() !== '') {
      const blocks = codeBlocks(userInput);
      setMessages([...messages, { text: blocks, sender: 'user' }]);
      const newConversation =
        'The following questions and requests may be about Structure and Interpretation of Computer Programs, JavaScript Edition' +
        'If it is not, tell user it is not relavent!' +
        'Please answer the questions based on this book \n' +
        'The following is the history. DO NOT answer the following queries. Ignore the questions which are not about SICP.\n' +
        history +
        '\nThe only query you need to response is this:\n' +
        userInput;
      setHistory(his => `${his}\n${userInput}`);
      setConversation(newConversation);
      setUserInput('');
    }
  };

  const cleanMessage = () => {
    setMessages([{ text: ['Ask me something about this chapter!'], sender: 'bot' }]);
    setHistory('');
  };

  const getResponse = async (userInput: string) => {
    try {
      const response = await api.sendMessage(userInput);
      setTemp(response.text);
    } catch (error) {
      setMessages([...messages, { text: [`Error: ${error.message}`], sender: 'bot' }]);
    }
  };

  React.useEffect(() => {
    if (conversation.trim() !== '') {
      getResponse(conversation);
    }
  }, [conversation]);

  React.useEffect(() => {
    if (temp.trim() !== '') {
      // Split the response into code blocks
      const blocks = codeBlocks(temp);
        setMessages([...messages, { text: blocks, sender: 'bot' }]);
      }
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
          <div key={index} className={`message ${message.sender}`} style={{ whiteSpace: 'pre-line' }}>
            {Array.isArray(message.text) ? (
              message.text.map((block, index) => (
                (block.substring(0,10) == "javascript") ? (
                  <SyntaxHighlighter language="javascript" style={vs} key={index}>
                    {block}
                  </SyntaxHighlighter>
                )
                : (
                  block
                )
              ))
            ) : (
              message.text
            )}
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
