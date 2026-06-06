import classNames from 'classnames';
import { useRef, useState } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import pixelLogo from 'src/assets/pixel.jpg';
import { useSession } from 'src/commons/utils/Hooks';
import { clampPosition } from 'src/pages/sicp/subcomponents/chatbot/Chatbot';
import ChatbotButton from 'src/pages/sicp/subcomponents/chatbot/ChatbotButton';
import { CHATBOT_BUTTON_DRAG_HANDLE_CLASS_NAME } from 'src/pages/sicp/subcomponents/chatbot/constants';

import RagChatBox from './RagChatBox';

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
          className={classNames(
            'fixed right-0 bottom-0 z-1000 max-h-screen max-w-[100vw]',
            isSnippetOpen ? 'hidden' : 'block',
          )}
          style={{ display: isSnippetOpen ? 'none' : 'block' }}
        >
          <div className="relative">
            {isDivVisible && (
              <div
                className={
                  'absolute right-16.25 bottom-2.5 h-auto w-65 rounded-[5px] border border-black bg-[#f1f1f1] pr-2.5'
                }
              >
                <p className="m-0 whitespace-normal break-normal px-2 py-1 text-right text-[13px]">
                  I am Pixel, your CS1101S assistant
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
