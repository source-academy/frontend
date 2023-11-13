import * as React from 'react';
import logo from 'src/assets/SA.jpg';

import ChatBox from './ChatBox';

interface ChatbotProps {
  getChapter: () => string;
  getText: () => string;
}

const Chatbot: React.FC<ChatbotProps> = ({ getChapter, getText }) => {
  const [isPop, setPop] = React.useState(false);
  const [tipsMessage, setTipsMessage] = React.useState('You can click me for a chat');
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const tipsBoxRef = React.useRef<HTMLDivElement | null>(null);

  const togglePop = () => {
    setPop(!isPop);
    if (!isPop) {
      setTipsMessage('');
    } else {
      setTipsMessage('You can click me for a chat');
    }
  };

  React.useEffect(() => {
    const button = buttonRef.current;
    const tipsBox = tipsBoxRef.current;

    const handleMouseEnter = () => {
      if (tipsBox) {
        tipsBox.style.display = 'block';
      }
    };

    const handleMouseLeave = () => {
      if (tipsBox) {
        tipsBox.style.display = 'none';
      }
    };

    button?.addEventListener('mouseenter', handleMouseEnter);
    button?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button?.removeEventListener('mouseenter', handleMouseEnter);
      button?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="bot-container">
      <div className="bot-area">
        <div className="tips-box" ref={tipsBoxRef}>
          <p className="tips-message">
            I am your little SA bot
            <br />
            {tipsMessage}
          </p>
        </div>
        <button className="bot-button" onClick={togglePop} ref={buttonRef}>
          <img src={logo} className="iSA" alt="SA Logo" />
        </button>
      </div>
      {isPop && <ChatBox getChapter={getChapter} getText={getText} />}
    </div>
  );
};

export default Chatbot;
