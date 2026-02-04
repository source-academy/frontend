import { Ace } from 'ace-builds';
import React from 'react';
import Draggable, { DraggableEvent, DraggableEventHandler } from 'react-draggable';
import Keyboard from 'react-simple-keyboard';

type Props = {
  targetKeyboardInput: Ace.Editor | null;
};

const MobileKeyboard: React.FC<Props> = props => {
  const [isKeyboardShown, setIsKeyboardShown] = React.useState(false);
  const [buttonContent, setButtonContent] = React.useState('ᐸ');
  const [keyboardPosition, setKeyboardPosition] = React.useState({ x: 0, y: 0 });
  const [targetKeyboardInput, setTargetKeyboardInput] = React.useState<Ace.Editor | null>(null);
  const [lastKeyPressed, setLastKeyPressed] = React.useState<string>('');
  const [touchStartInfo, setTouchStartInfo] = React.useState({ x: 0, y: 0, time: 0 });

  const onDrag: DraggableEventHandler = (
    e: DraggableEvent,
    position: { x: number; y: number }
  ): void => {
    setKeyboardPosition(position);
  };

  const handlePreventDefault = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
  };

  const handleHiding = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (isKeyboardShown) {
      //do hiding
      document.getElementById('mobile-keyboard-toggle')!.style.setProperty('display', 'none');
      document.getElementById('mobile-floating-toggle')!.style.setProperty('width', '42px');
      document.getElementById('mobile-floating-toggle')!.style.setProperty('opacity', '0.6');
      setButtonContent('ᐸ');
      setIsKeyboardShown(false);
    } else {
      //do showing
      document.getElementById('mobile-keyboard-toggle')!.style.setProperty('display', 'flex');
      document.getElementById('mobile-floating-toggle')!.style.setProperty('width', '99%');
      document.getElementById('mobile-floating-toggle')!.style.setProperty('opacity', '1');
      setButtonContent('ᐳ');
      setIsKeyboardShown(true);
    }
  };

  const handleKeyPress = (button: string) => {
    if (!props.targetKeyboardInput) {
      return;
    }

    setTargetKeyboardInput(props.targetKeyboardInput);
    setLastKeyPressed(button);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Get the touch coordinates and current time
    const touch = e.touches[0];
    setTouchStartInfo({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // Compare the end position with the start position
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartInfo.x;
    const deltaY = touch.clientY - touchStartInfo.y;
    const deltaTime = Date.now() - touchStartInfo.time;

    // Define thresholds for what you consider a swipe vs a tap
    const swipeThreshold = 30; // pixels
    const tapThresholdTime = 200; // milliseconds

    if (
      Math.abs(deltaX) < swipeThreshold &&
      Math.abs(deltaY) < swipeThreshold &&
      deltaTime < tapThresholdTime
    ) {
      handleKeyRelease();
    }
  };

  const handleKeyRelease = () => {
    if (!targetKeyboardInput) {
      return;
    }

    const editor = targetKeyboardInput;

    if (lastKeyPressed === '{arrowleft}') {
      editor.navigateLeft();
    } else if (lastKeyPressed === '{arrowright}') {
      editor.navigateRight();
    } else if (lastKeyPressed === '{bksp}') {
      editor.remove('left');
    } else if (lastKeyPressed === '{tab}') {
      editor.insert('\t');
    } else if (['+', '-', '*', '/', '%', '=>', '===', '&&', '||'].includes(lastKeyPressed)) {
      editor.insert(' ' + lastKeyPressed + ' ');
    } else {
      editor.insert(lastKeyPressed);
    }
  };

  const keyboardProps = {
    onKeyPress: handleKeyPress,
    disableButtonHold: true,
    baseClass: 'simple-keyboard-shortcut',
    layout: {
      default: ['{ } ( ) " \' _ => ; {tab} && || ! < > = === + - * / % // {arrowleft} {arrowright}']
    },
    buttonTheme: [
      {
        class: 'mobile-navigation',
        buttons: '{arrowleft} {arrowright}'
      },
      {
        class: 'big-buttons',
        buttons: '=== &&'
      }
    ],
    theme: 'hg-theme-default',
    preventMouseDownDefault: true,
    disableCaretPositioning: false
  };

  return (
    <Draggable
      axis="y"
      handle="#floating-dragHandle"
      position={keyboardPosition}
      bounds={{ top: -200, left: 0, right: 0, bottom: +200 }}
      onDrag={onDrag}
    >
      <div className="mobile-floating-keyboard" id="mobile-floating-toggle">
        <button
          className="mobile-floating-toggle"
          onClick={handleHiding}
          onMouseDown={handlePreventDefault}
        >
          {buttonContent}
        </button>

        <div className="mobile-keyboard-toggle-container" id="mobile-keyboard-toggle">
          <div
            className="mobile-keyboard-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Keyboard {...keyboardProps} />
          </div>
        </div>

        <div id="floating-dragHandle">:</div>
      </div>
    </Draggable>
  );
};

export default MobileKeyboard;
