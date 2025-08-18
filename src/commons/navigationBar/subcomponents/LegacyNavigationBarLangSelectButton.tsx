import { Position } from '@blueprintjs/core';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  cLanguages,
  getLanguageConfig,
  javaLanguages,
  pyLanguages,
  SALanguage,
  schemeLanguages,
  sourceLanguages,
  SUPPORTED_LANGUAGES,
  SupportedLanguage
} from 'src/commons/application/ApplicationTypes';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { playgroundConfigLanguage } from 'src/features/playground/PlaygroundActions';

const LegacyNavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = useTypedSelector(store => store.playground.languageConfig.mainLanguage);
  const dispatch = useDispatch();

  // Legacy default sublanguage mapping
  const defaultSublanguages: { [lang in SupportedLanguage]: SALanguage } = {
    [SupportedLanguage.JAVASCRIPT]: sourceLanguages[0],
    [SupportedLanguage.PYTHON]: pyLanguages[0],
    [SupportedLanguage.SCHEME]: schemeLanguages[0],
    [SupportedLanguage.JAVA]: javaLanguages[0],
    [SupportedLanguage.C]: cLanguages[0]
  };

  const selectLang = (language: SupportedLanguage) => {
    const { chapter, variant } = defaultSublanguages[language];
    dispatch(playgroundConfigLanguage(getLanguageConfig(chapter, variant)));
    dispatch(WorkspaceActions.chapterSelect(chapter, variant, 'playground'));
    setIsOpen(false);
  };

  return (
    <SimpleDropdown
      options={SUPPORTED_LANGUAGES.map(l => ({ value: l, label: l }))}
      onClick={selectLang}
      selectedValue={lang}
      popoverProps={{ position: Position.BOTTOM_RIGHT, onClose: () => setIsOpen(false), isOpen }}
      buttonProps={{
        rightIcon: 'caret-down',
        onClick: () => setIsOpen(true),
        'data-testid': 'NavigationBarLangSelectButton'
      }}
    />
  );
};

export default LegacyNavigationBarLangSelectButton;
