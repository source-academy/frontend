import { Ace } from 'ace-builds';
import React from 'react';
import Draggable, { DraggableEvent, DraggableEventHandler } from 'react-draggable';
import Keyboard from 'react-simple-keyboard';

export type MobileKeyboardProps = OwnProps;

type OwnProps = {
  targetKeyboardInput: Ace.Editor | null;
};

const MobileKeyboard: React.FC<MobileKeyboardProps> = props => {
  const [isKeyboardShown, setIsKeyoardShown] = React.useState(false);
  const [buttonContent, setButtonContent] = React.useState('ᐸ');
  const [keyboardPosition, setKeyboardPosition] = React.useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = React.useState(1);

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
      setIsKeyoardShown(false);
    } else {
      //do showing
      document.getElementById('mobile-keyboard-toggle')!.style.setProperty('display', 'flex');
      document.getElementById('mobile-floating-toggle')!.style.setProperty('width', '99%');
      document.getElementById('mobile-floating-toggle')!.style.setProperty('opacity', '1');
      setButtonContent('ᐳ');
      setIsKeyoardShown(true);
    }
  };

  const handleRowToggle = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setSelectedIndex((selectedIndex + 1) % 3);
    const keyboardClass = document.getElementsByClassName('simple-keyboard-shortcut');
    Array.from(keyboardClass as HTMLCollectionOf<HTMLElement>)[0].style.top =
      -selectedIndex * 45 + 'px';
  };

  const handleKeyPress = (button: string) => {
    if (!props.targetKeyboardInput) {
      return;
    }
    const editor = props.targetKeyboardInput;
    if (button === '{arrowleft}') {
      editor.navigateLeft();
    } else if (button === '{arrowright}') {
      editor.navigateRight();
    } else if (button === '{bksp}') {
      editor.remove('left');
    } else if (button === '{tab}') {
      editor.insert('\t');
    } else if (['+', '-', '*', '/', '%', '=>', '===', '&&', '||'].includes(button)) {
      editor.insert(' ' + button + ' ');
    } else {
      editor.insert(button);
    }
  };

  const keyboardProps = {
    onKeyPress: handleKeyPress,
    baseClass: 'simple-keyboard-shortcut',
    layout: {
      default: [
        '{ } ( ) " \' _ => ;',
        '{tab} && || ! < > = ===',
        '+ - * / % // {arrowleft} {arrowright}'
      ]
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
          <div className="mobile-keyboard-container">
            <Keyboard {...keyboardProps} />
          </div>
          <button
            className="mobile-keyboard-row-toggle"
            onClick={handleRowToggle}
            onMouseDown={handlePreventDefault}
          >
            ⤸
          </button>
        </div>

        <div id="floating-dragHandle">:</div>
      </div>
    </Draggable>
  );
};

export default MobileKeyboard;
