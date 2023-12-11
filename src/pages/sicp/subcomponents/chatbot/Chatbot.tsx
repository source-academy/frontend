import { AnchorButton, Icon } from '@blueprintjs/core';
import * as React from 'react';
import logo from 'src/assets/SA.jpg';

import ChatBox from './ChatBox';

interface ChatbotProps {
  getSection: () => string;
  getText: () => string;
}

const Chatbot: React.FC<ChatbotProps> = ({ getSection, getText }) => {
  const [isPop, setPop] = React.useState(false);
  const [isDivVisible, setIsDivVisible] = React.useState(false);
  const [tipsMessage, setTipsMessage] = React.useState('You can click me for a chat');
  // const tipsBoxRef = React.useRef<HTMLDivElement | null>(null);

  // To Show reminder words
  const togglePop = () => {
    setPop(!isPop);
    if (!isPop) {
      setTipsMessage('');
    } else {
      setTipsMessage('You can click me for a chat');
    }
  };

  return (
    <div className="bot-container">
      <div className="bot-area">
        {isDivVisible && (
          // <div className="tips-box">
          <div className="tips-box">
            <p className="tips-message">
              I am Louis, your SICP bot
              <br />
              {tipsMessage}
            </p>
          </div>
        )}
        <AnchorButton
          className="bot-button"
          onMouseEnter={() => setIsDivVisible(true)}
          onMouseLeave={() => setIsDivVisible(false)}
          onClick={togglePop}
          icon={<Icon icon={<img src={logo} className="iSA" alt="SA Logo" />} />}
        ></AnchorButton>
      </div>
      {isPop && <ChatBox getSection={getSection} getText={getText} />}
    </div>
  );
};

export default Chatbot;
