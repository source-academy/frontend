import { AnchorButton, Icon } from '@blueprintjs/core';
import classNames from 'classnames';

import { CHATBOT_BUTTON_DRAG_HANDLE_CLASS_NAME } from './constants';

type Props = {
  src: string;
  alt?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
};

function FloatingChatbotButton({
  src,
  alt = 'Chatbot logo',
  onMouseEnter,
  onMouseLeave,
  onClick,
}: Props) {
  return (
    <AnchorButton
      className={classNames(
        CHATBOT_BUTTON_DRAG_HANDLE_CLASS_NAME,
        'absolute right-2.5 bottom-2.5 flex size-12.5 cursor-grab select-none items-center justify-center rounded-full border-0 bg-transparent p-0 active:cursor-grabbing [-webkit-user-select:none]',
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      icon={
        <Icon
          icon={
            <img
              src={src}
              className="pointer-events-none size-full select-none rounded-full object-cover [-webkit-user-drag:none]"
              alt={alt}
              draggable={false}
            />
          }
        />
      }
    />
  );
}

export default FloatingChatbotButton;
