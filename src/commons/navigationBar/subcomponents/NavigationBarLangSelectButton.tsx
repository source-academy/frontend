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
import { getSupportedLanguages, ILanguageDefinition } from 'src/commons/directory/language';
import { useFeature } from 'src/commons/featureFlags/useFeature';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { flagConductorEnable } from 'src/features/conductor/flagConductorEnable';
import {
  playgroundConductorEvaluator,
  playgroundConductorLanguage,
  playgroundConfigLanguage
} from 'src/features/playground/PlaygroundActions';

// TODO: Hardcoded to use the first sublanguage for each language
const defaultSublanguages: {
  [lang in SupportedLanguage]: SALanguage;
} = {
  [SupportedLanguage.JAVASCRIPT]: sourceLanguages[0],
  [SupportedLanguage.PYTHON]: pyLanguages[0],
  [SupportedLanguage.SCHEME]: schemeLanguages[0],
  [SupportedLanguage.JAVA]: javaLanguages[0],
  [SupportedLanguage.C]: cLanguages[0]
};

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = useTypedSelector(store => store.playground.languageConfig.mainLanguage);
  const dispatch = useDispatch();

  const conductorEnabled = useFeature(flagConductorEnable);
  const currentLang = useTypedSelector(store => store.playground.conductorLanguage);
  if (conductorEnabled) {
    const languages = getSupportedLanguages();
    const selectLang = (language: ILanguageDefinition) => {
      dispatch(playgroundConductorLanguage(language));
      dispatch(playgroundConductorEvaluator(language.evaluators[0]));
      setIsOpen(false);
    };
    return (
      <SimpleDropdown
        options={languages.map(lang => ({ value: lang, label: lang.name }))}
        onClick={selectLang}
        selectedValue={currentLang}
        popoverProps={{ position: Position.BOTTOM_RIGHT, onClose: () => setIsOpen(false), isOpen }}
        buttonProps={{
          rightIcon: 'caret-down',
          onClick: () => setIsOpen(true),
          'data-testid': 'NavigationBarLangSelectButton'
        }}
      />
    );
  }

  const selectLang = (language: SupportedLanguage) => {
    const { chapter, variant } = defaultSublanguages[language];
    dispatch(playgroundConfigLanguage(getLanguageConfig(chapter, variant)));
    dispatch(WorkspaceActions.chapterSelect(chapter, variant, 'playground'));
    setIsOpen(false);
  };

  return (
    <SimpleDropdown
      options={SUPPORTED_LANGUAGES.map(lang => ({ value: lang, label: lang }))}
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

export default NavigationBarLangSelectButton;
