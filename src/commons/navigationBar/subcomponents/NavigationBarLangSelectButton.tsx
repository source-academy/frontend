import { Button, Menu, MenuItem, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { playgroundChangeLang } from 'src/features/playground/PlaygroundActions';
import { store } from 'src/pages/createStore';

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = store.getState().playground.lang;
  const dispatch = useDispatch();
  const selectLang = (language: string) => {
    dispatch(playgroundChangeLang(language));
    setIsOpen(false);
    console.log('LANG:', lang);
  };

  return (
    <Popover2
      hasBackdrop
      interactionKind="click"
      position={Position.BOTTOM_RIGHT}
      isOpen={isOpen}
      content={
        <Menu>
          <MenuItem onClick={() => selectLang('JavaScript')} text="JavaScript" />
          <MenuItem onClick={() => selectLang('Scheme')} text="Scheme" />
          <MenuItem onClick={() => selectLang('Python')} text="Python" />
        </Menu>
      }
      onClose={() => setIsOpen(false)}
    >
      <>
        <Button rightIcon="caret-down" onClick={() => setIsOpen(true)}>
          {lang}
        </Button>
      </>
    </Popover2>
  );
};

export default NavigationBarLangSelectButton;
