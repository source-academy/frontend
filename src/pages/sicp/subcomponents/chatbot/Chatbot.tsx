import { AnchorButton, Icon } from '@blueprintjs/core';
import * as React from 'react';
import logo from 'src/assets/SA.jpg';
import { useSession } from 'src/commons/utils/Hooks';
import { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import classes from 'src/styles/Chatbot.module.scss';

import ChatBox from './ChatBox';

type Props = {
  getSection: () => SicpSection;
  getText: () => string;
};

const Chatbot: React.FC<Props> = ({ getSection, getText }) => {
  const [isPop, setPop] = React.useState(false);
  const [isDivVisible, setIsDivVisible] = React.useState(false);
  const [tipsMessage, setTipsMessage] = React.useState('You can click me for a chat');
  const { isLoggedIn } = useSession();
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
    <div>
      {isLoggedIn && (
        <div className={classes['bot-container']}>
          <div className={classes['bot-area']}>
            {isDivVisible && (
              // <div className="tips-box">
              <div className={classes['tips-box']}>
                <p className={classes['tips-message']}>
                  I am Louis, your SICP bot
                  <br />
                  {tipsMessage}
                </p>
              </div>
            )}
            <AnchorButton
              className={classes['bot-button']}
              onMouseEnter={() => setIsDivVisible(true)}
              onMouseLeave={() => setIsDivVisible(false)}
              onClick={togglePop}
              icon={<Icon icon={<img src={logo} className={classes['iSA']} alt="SA Logo" />} />}
            ></AnchorButton>
          </div>
          {isPop && <ChatBox getSection={getSection} getText={getText} />}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
