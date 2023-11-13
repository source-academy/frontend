import { Buffer as NodeBuffer } from 'buffer';
import { ChatGPTAPI } from 'chatgpt';
import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Constants from 'src/commons/utils/Constants';

import SICPNotes from './SicpNotes';

Buffer.from('anything', 'base64');

if (!(window as any).Buffer) {
  (window as any).Buffer = NodeBuffer;
}

interface ChatBoxProps {
  getChapter: () => string;
  getText: () => string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ getChapter, getText }) => {
  const chatRef = React.useRef<HTMLDivElement | null>(null);
  const key = Constants.chatGptKey;
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<{ text: string[]; sender: 'user' | 'bot' }[]>([
    //todo: change the type fo text
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

  const codeBlocks = (temp: string) => {
    return temp.split('```');
  };

  const sendMessage = () => {
    if (userInput.trim() !== '') {
      const text = getText();
      const blocks = codeBlocks(userInput);
      setMessages([...messages, { text: blocks, sender: 'user' }]);
      const newConversation =
        'You are a competent tutor, assisting a student who is learning computer science following the textbook "Structure and Interpretation of Computer Programs,' +
        'JavaScript edition". The student request is about a paragraph of the book. The request may be a follow-up request to a request that was posed to you' +
        'previously. What follows are:\n' +
        '(1) the summary of chapter (2) the full paragraph, (3) the history of previous questions, and (4) the student question. Please answer the student request,' +
        'not the requests of the history. If the student request is not related to the book, ask them to ask questions that are related to the book. Donot say that I provide you text\n\n' +
        '\n(1) Here is the summary of this chapter:\n' +
        SICPNotes[getChapter()] +
        '\n(2) Here is the paragraph:\n' +
        text +
        '\n(3) Here is the history\n' +
        history +
        '\n(4) Here is the student question\n' +
        userInput;
      //console.log(newConversation);
      console.log(text.replaceAll("\n", ""));
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
      setIsLoading(true);
    }
  }, [conversation]);

  React.useEffect(() => {
    if (temp.trim() !== '') {
      // Split the response into code blocks
      setIsLoading(false);
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
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    chatRef.current?.scrollTo({ top: chatRef.current?.scrollHeight });
  };

  // const sendAndWrite = async (obj:any, i:number,j:number,message:string) => {
  //   const response = await api.sendMessage(userInput);
  //   obj[i][j] = response;
  // }
  // const testParagraphs = [,,""];
  // const testNotes = [];
  // const testQuries = [];
  // const prompts:any[] = [];
  // const answers = {} 
  // const test = () => {
  //   for (let i = 0; i < prompts.length; i++) {
  //     answers[i] = {};
  //     for (let j = 0; j < testQuries.length; j++) {
  //       sendAndWrite(answers, i, j, prompts[i](j))
  //     }
  //   }
  //   // wait for all to finish
  //   console.log(answers);
  // }
  
  return (
    <div className="chat-container">
      <div className="chat-message" ref={chatRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender}`}
            style={{ whiteSpace: 'pre-line' }}
          >
            {Array.isArray(message.text)
              ? message.text.map((block, index) =>
                  block.substring(0, 10) === 'javascript' ? (
                    <SyntaxHighlighter language="javascript" style={vs} key={index}>
                      {block}
                    </SyntaxHighlighter>
                  ) : (
                    block
                  )
                )
              : message.text}
          </div>
        ))}
        {isLoading && <p>is loading...</p>}
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

