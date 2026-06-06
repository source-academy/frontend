import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { useSession } from 'src/commons/utils/Hooks';

import { CHATBOT_BUTTON_DRAG_HANDLE_CLASS_NAME } from './constants';
import FloatingChatbotButton from './FloatingChatbotButton';

type FloatingChatbotRenderProps = {
  activeSnippetId: string;
  setActiveSnippetId: (id: string) => void;
  isExpanded: boolean;
  toggleExpanded: () => void;
};

type Props = {
  avatarSrc: string;
  avatarAlt: string;
  introMessage: string;
  defaultTipsMessage: string;
  children: (props: FloatingChatbotRenderProps) => React.ReactNode;
};

const ICON_SIZE = 50;
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

function FloatingChatbot({
  avatarSrc,
  avatarAlt,
  introMessage,
  defaultTipsMessage,
  children,
}: Props) {
  const { isLoggedIn } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isTipsVisible, setIsTipsVisible] = useState(false);
  const [activeSnippetId, setActiveSnippetId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSnippetOpen = activeSnippetId !== '';

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev;
      setPosition(pos => clampPosition(pos.x, pos.y, true, next));
      return next;
    });
  }, []);

  const toggleOpen = useCallback(() => {
    if (isDragging) {
      return;
    }

    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) {
      setPosition(pos => clampPosition(pos.x, pos.y, true, isExpanded));
    }
  }, [isDragging, isExpanded, isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setPosition(pos => clampPosition(pos.x, pos.y, isOpen, isExpanded));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, isOpen]);

  const handleDragStart = () => {
    setIsDragging(false);
  };

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    setIsDragging(true);
    setIsTipsVisible(false);
    setPosition({ x: data.x, y: data.y });
  };

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    const clamped = clampPosition(data.x, data.y, isOpen, isExpanded);
    setPosition(clamped);
    setTimeout(() => setIsDragging(false), 0);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
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
      >
        {isTipsVisible && (
          <div
            className={
              'absolute right-16.25 bottom-2.5 h-auto w-65 rounded-[5px] border border-black bg-[#f1f1f1] pr-2.5'
            }
          >
            <p className="m-0 whitespace-normal break-normal px-2 py-1 text-right text-[13px]">
              {introMessage}
              {isOpen && (
                <>
                  <br />
                  {defaultTipsMessage}
                </>
              )}
            </p>
          </div>
        )}
        {isOpen &&
          children({
            activeSnippetId,
            setActiveSnippetId,
            isExpanded,
            toggleExpanded,
          })}
        <FloatingChatbotButton
          src={avatarSrc}
          alt={avatarAlt}
          onMouseEnter={() => !isDragging && setIsTipsVisible(true)}
          onMouseLeave={() => setIsTipsVisible(false)}
          onClick={toggleOpen}
        />
      </div>
    </Draggable>
  );
}

export default FloatingChatbot;
