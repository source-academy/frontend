import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import Keyboard from 'react-simple-keyboard';

export type MobileKeyboardProps = OwnProps;

type OwnProps = {
  editorRef: React.RefObject<ReactAce>;
};

const MobileKeyboard: React.FC<MobileKeyboardProps> = props => {
  const handleKeyPress = (button: string) => {
    if (button === '{arrowleft}') {
      props.editorRef.current!.editor.navigateLeft();
    } else if (button === '{arrowright}') {
      props.editorRef.current!.editor.navigateRight();
    } else if (button === '{bksp}') {
      props.editorRef.current!.editor.remove('left');
    } else if (button === '{tab}') {
      props.editorRef.current!.editor.insert('\t');
    } else if (['+', '-', '*', '/', '%', '=>', '===', '&&', '||'].includes(button)) {
      props.editorRef.current!.editor.insert(' ' + button + ' ');
    } else {
      props.editorRef.current!.editor.insert(button);
    }
  };

  const keyboardProps = {
    onKeyPress: handleKeyPress,
    layout: {
      default: [
        '{ } ( ) " _ => === ;',
        '{tab} && || ! < > = //',
        '+ - * / % {arrowleft} {arrowright}'
      ]
    },
    theme: 'hg-theme-default',
    preventMouseDownDefault: true,
    disableCaretPositioning: false
  };

  return <Keyboard {...keyboardProps} />;
};

export default MobileKeyboard;
