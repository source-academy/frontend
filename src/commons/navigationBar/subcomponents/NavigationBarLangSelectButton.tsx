import { Button, Menu, MenuItem, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from 'src/commons/application/ApplicationTypes';
import { playgroundChangeLang } from 'src/features/playground/PlaygroundActions';
import { store } from 'src/pages/createStore';

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = store.getState().playground.lang;
  const dispatch = useDispatch();
  const selectLang = (language: SupportedLanguage) => {
    dispatch(playgroundChangeLang(language));
    setIsOpen(false);
  };

  return (
    <Popover2
      hasBackdrop
      interactionKind="click"
      position={Position.BOTTOM_RIGHT}
      isOpen={isOpen}
      content={
        <Menu>
          {SUPPORTED_LANGUAGES.map(language => (
            <MenuItem key={language} onClick={() => selectLang(language)} text={language} />
          ))}
        </Menu>
      }
      onClose={() => setIsOpen(false)}
    >
      <Button rightIcon="caret-down" onClick={() => setIsOpen(true)}>
        {lang}
      </Button>
    </Popover2>
  );
};

export default NavigationBarLangSelectButton;
