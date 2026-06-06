import { useRef, useState } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import pixelLogo from 'src/assets/pixel.jpg';
import { useSession } from 'src/commons/utils/Hooks';
import ChatbotButton from 'src/pages/sicp/subcomponents/chatbot/ChatbotButton';
import { CHATBOT_BUTTON_DRAG_HANDLE_CLASS_NAME } from 'src/pages/sicp/subcomponents/chatbot/constants';

import classes from './RagChatbot.module.css';
import RagChatBox from './RagChatBox';

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
  expanded: boolean,
): { x: number; y: number } => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const containerW = chatOpen ? (expanded ? CHAT_EXPANDED_WIDTH : CHAT_WIDTH) : ICON_SIZE;
  const expandedH = Math.min(vh * CHAT_EXPANDED_HEIGHT_VH, CHAT_EXPANDED_MAX_HEIGHT);
  const containerH = chatOpen ? (expanded ? expandedH : CHAT_HEIGHT) + ICON_SIZE : ICON_SIZE;

  const minX = containerW - vw;
  const maxX = 0;
  const minY = containerH - vh;
  const maxY = 0;

  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  };
};

function RagChatbot() {
  const { isLoggedIn } = useSession();
  const [isPop, setPop] = useState(false);
  const [isDivVisible, setIsDivVisible] = useState(false);
  const [tipsMessage, setTipsMessage] = useState('Click me for a chat!');
  const [activeSnippetId, setActiveSnippetId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSnippetOpen = activeSnippetId !== '';

  // Only show for logged-in users
  if (!isLoggedIn) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      setPosition(pos => clampPosition(pos.x, pos.y, true, next));
      return next;
    });
  };

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
      setTipsMessage('Click me for a chat!');
    }
  };

  const handleDragStart = () => {
    setIsDragging(false);
  };

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    setIsDragging(true);
    setIsDivVisible(false);
    setPosition({ x: data.x, y: data.y });
  };

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    const clamped = clampPosition(data.x, data.y, isPop, isExpanded);
    setPosition(clamped);
    setTimeout(() => setIsDragging(false), 0);
  };

  return (
    <div>
      <Draggable
        nodeRef={nodeRef}
        handle={`.${CHATBOT_BUTTON_DRAG_HANDLE_CLASS_NAME}`}
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
                  {'I am Pixel, your CS1101S assistant'}
                  <br />
                  {tipsMessage}
                </p>
              </div>
            )}
            <ChatbotButton
              src={pixelLogo}
              alt="Pixel Logo"
              onMouseEnter={() => !isDragging && setIsDivVisible(true)}
              onMouseLeave={() => setIsDivVisible(false)}
              onClick={togglePop}
            />
          </div>
          {isPop && (
            <RagChatBox
              isExpanded={isExpanded}
              toggleExpanded={toggleExpanded}
              activeSnippetId={activeSnippetId}
              setActiveSnippetId={setActiveSnippetId}
            />
          )}
        </div>
      </Draggable>
    </div>
  );
}

export default RagChatbot;
