import { Button, Menu, MenuItem, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  InternationalLanguage,
  SUPPORTED_INTERNATIONAL_LANGUAGES
} from 'src/commons/application/ApplicationTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { playgroundInternationalLanguage } from 'src/features/playground/PlaygroundActions';

const defaultLanguages: { [key in InternationalLanguage]: string } = {
  en: 'English',
  zh: 'Chinese',
  de: 'German'
};

const NavigationBarInternationalLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = useTypedSelector(store => store.playground.internationalLanguage);
  const dispatch = useDispatch();
  const selectLang = (language: InternationalLanguage) => {
    console.log('language is', language);
    dispatch(playgroundInternationalLanguage(language));
    setIsOpen(false);
  };

  /* 
  const { chapter, variant } = defaultSublanguages[language];
    dispatch(playgroundConfigLanguage(getLanguageConfig(chapter, variant)));
    dispatch(chapterSelect(chapter, variant, 'playground'));
    setIsOpen(false);
  */
  return (
    <Popover2
      hasBackdrop
      interactionKind="click"
      position={Position.BOTTOM_RIGHT}
      isOpen={isOpen}
      content={
        <Menu>
          {SUPPORTED_INTERNATIONAL_LANGUAGES.map(language => (
            <MenuItem
              key={language}
              onClick={() => selectLang(language)}
              text={defaultLanguages[language]}
            />
          ))}
        </Menu>
      }
      onClose={() => setIsOpen(false)}
    >
      <Button rightIcon="caret-down" onClick={() => setIsOpen(true)}>
        {defaultLanguages[lang]}
      </Button>
    </Popover2>
  );
};

export default NavigationBarInternationalLangSelectButton;
