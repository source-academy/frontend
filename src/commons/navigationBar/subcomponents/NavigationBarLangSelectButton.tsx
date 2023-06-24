import { Button, Menu, MenuItem, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  getLanguageConfig,
  pyLanguages,
  SALanguage,
  schemeLanguages,
  sourceLanguages,
  SUPPORTED_LANGUAGES,
  SupportedLanguage
} from 'src/commons/application/ApplicationTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { chapterSelect } from 'src/commons/workspace/WorkspaceActions';
import { playgroundConfigLanguage } from 'src/features/playground/PlaygroundActions';

// TODO: Hardcoded to use the first sublanguage for each language
const defaultSublanguages: {
  [lang in SupportedLanguage]: SALanguage;
} = {
  [SupportedLanguage.JAVASCRIPT]: sourceLanguages[0],
  [SupportedLanguage.PYTHON]: pyLanguages[0],
  [SupportedLanguage.SCHEME]: schemeLanguages[0]
};

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = useTypedSelector(store => store.playground.languageConfig.mainLanguage);
  const dispatch = useDispatch();
  const selectLang = (language: SupportedLanguage) => {
    const { chapter, variant } = defaultSublanguages[language];
    dispatch(playgroundConfigLanguage(getLanguageConfig(chapter, variant)));
    dispatch(chapterSelect(chapter, variant, 'playground'));
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
      <Button
        rightIcon="caret-down"
        onClick={() => setIsOpen(true)}
        data-testid="NavigationBarLangSelectButton"
      >
        {lang}
      </Button>
    </Popover2>
  );
};

export default NavigationBarLangSelectButton;
