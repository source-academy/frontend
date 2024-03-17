import { Button } from '@blueprintjs/core';
import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useSession } from 'src/commons/utils/Hooks';
import { SourceTheme } from 'src/features/sicp/SourceTheme';
import classes from 'src/styles/Chatbot.module.scss';

import { chat } from '../../../../commons/sagas/RequestsSaga';
import SICPNotes from './SicpNotes';

type Props = {
  getSection: () => string;
  getText: () => string;
};

const ChatBox: React.FC<Props> = ({ getSection, getText }) => {
  const chatRef = React.useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: 'user' | 'bot'; content: string[] }[]>([
    { content: ['Ask me something about this paragraph!'], role: 'bot' }
  ]);
  const [userInput, setUserInput] = React.useState('');
  const [contentHistory, setContentHistory] = React.useState<Array<string>>([]);
  const [roleHistory, setRoleHistory] = React.useState<Array<string>>([]);
  const { accessToken, refreshToken } = useSession();

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  // To get code snippets
  const codeBlocks = (temp: string) => {
    return temp.split('```');
  };

  const text = () => {
    return '\n(2) Here is the paragraph:\n' + getText();
  };

  const section = () => {
    const sectionNumber = getSection();
    return parseInt(sectionNumber.charAt(0), 10) > 3
      ? '\n(1) There is no section summary for this section. Please answer the question based on the following paragraph\n'
      : '\n(1) Here is the summary of this section:\n' + SICPNotes[getSection() as keyof typeof SICPNotes];
  };

  function getPrompt() {
    const prompt =
      'You are a competent tutor, assisting a student who is learning computer science following the textbook "Structure and Interpretation of Computer Programs,' +
      'JavaScript edition". The student request is about a paragraph of the book. The request may be a follow-up request to a request that was posed to you' +
      'previously.\n' +
      'What follows are:\n' +
      '(1) the summary of section (2) the full paragraph. Please answer the student request,' +
      'not the requests of the history. If the student request is not related to the book, ask them to ask questions that are related to the book. Donot say that I provide you text\n\n' +
      section() +
      text();
    return prompt;
  }

  const sendMessage = async () => {
    if (userInput.trim() === '') {
      return;
    }
    // clean the input immediately after the user sends the message so that the user would not feel the lag
    const _userInput = userInput;
    const _messages = messages;
    setUserInput('');
    const blocks = codeBlocks(_userInput);
    setMessages([...messages, { role: 'user', content: blocks }]);
    setIsLoading(true);

    const prompt = getPrompt();
    const payload: { role: string; content: string }[] = [{ role: 'system', content: prompt }];
    for (let i = 0; i < contentHistory.length; i++) {
      payload.push({ role: roleHistory[i], content: contentHistory[i] });
    }
    payload.push({ role: 'user', content: _userInput });
    const tokens = { accessToken: accessToken!, refreshToken: refreshToken! };
    chat(tokens, payload)
      .then(text => {
        const keptContentHistory =
          contentHistory.length >= 20 ? contentHistory.slice(2) : contentHistory;
        const keptRoleHistory = roleHistory.length >= 20 ? roleHistory.slice(2) : roleHistory;
        setContentHistory([...keptContentHistory, _userInput, text]);
        setRoleHistory([...keptRoleHistory, 'user', 'assistant']);
        setMessages([
          ..._messages,
          { role: 'user', content: blocks },
          {
            role: 'bot',
            content: [text + '\n\nThe answer is generated by GPT-4 and may not be correct.']
          }
        ]);
      })
      .catch(e => {
        setMessages([
          ..._messages,
          { role: 'user', content: blocks },
          { content: [`Sorry, I am down with a cold, please try again later.`], role: 'bot' }
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const cleanMessage = () => {
    setMessages([{ content: ['Ask me something about this paragraph!'], role: 'bot' }]);
    setContentHistory([]);
    setRoleHistory([]);
  };

  const renderMessageContent = (message: string | string[]) => {
    if (!Array.isArray(message)) {
      return message;
    }

    return message.map((block, index) =>
      // Assume that only javascript code snippets will appear
      block.substring(0, 10) === 'javascript' ? (
        <SyntaxHighlighter language="javascript" style={SourceTheme} key={index}>
          {block.substring(11, block.length)}
        </SyntaxHighlighter>
      ) : (
        block
      )
    );
  };

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

  return (
    <div className={classes['chat-container']}>
      <div className={classes['chat-message']} ref={chatRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={classes[`${message.role}`]}
            style={{ whiteSpace: 'pre-line' }}
          >
            {renderMessageContent(message.content)}
          </div>
        ))}
        {isLoading && <p>loading...</p>}
      </div>
      <input
        type="text"
        className={classes['user-input']}
        placeholder="Type your message here..."
        value={userInput}
        onChange={handleUserInput}
        onKeyDown={keyDown}
      />
      <div className={classes['button-container']}>
        <Button className={classes['button-send']} onClick={sendMessage}>
          Send
        </Button>
        <Button className={classes['button-clean']} onClick={cleanMessage}>
          Clean
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
