import { AnchorButton, Icon } from '@blueprintjs/core';
import * as React from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import logo from 'src/assets/SA.jpg';
import { useSession } from 'src/commons/utils/Hooks';
import { SicpSection } from 'src/features/sicp/chatCompletion/chatCompletion';
import classes from 'src/styles/Chatbot.module.scss';

import ChatBox from './ChatBox';

type Props = {
  getSection: () => SicpSection;
  getText: () => string;
};

const ICON_SIZE = 70;
const CHAT_WIDTH = 400;
const CHAT_HEIGHT = 450;
const CHAT_EXPANDED_WIDTH = 700;
const CHAT_EXPANDED_HEIGHT_VH = 0.8;
const CHAT_EXPANDED_MAX_HEIGHT = 800;

const clampPosition = (
  x: number,
  y: number,
  chatOpen: boolean,
  expanded: boolean
): { x: number; y: number } => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const containerW = chatOpen ? (expanded ? CHAT_EXPANDED_WIDTH : CHAT_WIDTH) : ICON_SIZE;
  const expandedH = Math.min(vh * CHAT_EXPANDED_HEIGHT_VH, CHAT_EXPANDED_MAX_HEIGHT);
  const containerH = chatOpen
    ? (expanded ? expandedH : CHAT_HEIGHT) + ICON_SIZE
    : ICON_SIZE;

  const minX = containerW - vw;
  const maxX = 0;
  const minY = containerH - vh;
  const maxY = 0;

  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y))
  };
};

const Chatbot: React.FC<Props> = ({ getSection, getText }) => {
  const [isPop, setPop] = React.useState(false);
  const [isDivVisible, setIsDivVisible] = React.useState(false);
  const [tipsMessage, setTipsMessage] = React.useState('You can click me for a chat');
  const [activeSnippetId, setActiveSnippetId] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const { isLoggedIn } = useSession();
  const nodeRef = React.useRef<HTMLDivElement>(null);


  const isSnippetOpen = activeSnippetId !== '';

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev;
      setPosition(pos => clampPosition(pos.x, pos.y, true, next));
      return next;
    });
  }, []);

  const togglePop = () => {
    if (isDragging) {
      return;
    }
    const willOpen = !isPop;
    setPop(willOpen);
    if (willOpen) {
      setTipsMessage('');
      setPosition(pos => clampPosition(pos.x, pos.y, true, isExpanded));
    } else {
      setTipsMessage('You can click me for a chat');
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      setPosition(pos => clampPosition(pos.x, pos.y, isPop, isExpanded));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPop, isExpanded]);

  const handleDragStart = () => {
    setIsDragging(false);
  };

  const handleDrag = (_e: DraggableEvent, _data: DraggableData) => {
    setIsDragging(true);
    setIsDivVisible(false);
  };

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    const clamped = clampPosition(data.x, data.y, isPop, isExpanded);
    setPosition(clamped);
    setTimeout(() => setIsDragging(false), 0);
  };

  return (
    <div>
      {isLoggedIn && (
        <Draggable
          nodeRef={nodeRef}
          handle={`.${classes['bot-button']}`}
          position={position}
          onStart={handleDragStart}
          onDrag={handleDrag}
          onStop={handleDragStop}
        >
          <div
            ref={nodeRef}
            className={classes['bot-container']}
            style={{ display: isSnippetOpen ? 'none' : 'block' }}
          >
            <div className={classes['bot-area']}>
              {isDivVisible && (
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
                onMouseEnter={() => !isDragging && setIsDivVisible(true)}
                onMouseLeave={() => setIsDivVisible(false)}
                onClick={togglePop}
                icon={
                  <Icon
                    icon={
                      <img
                        src={logo}
                        className={classes['iSA']}
                        alt="SA Logo"
                        draggable={false}
                      />
                    }
                  />
                }
              />
            </div>
            {isPop && (
              <ChatBox
                getSection={getSection}
                getText={getText}
                activeSnippetId={activeSnippetId}
                setActiveSnippetId={setActiveSnippetId}
                isExpanded={isExpanded}
                toggleExpanded={toggleExpanded}
              />
            )}
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default Chatbot;
