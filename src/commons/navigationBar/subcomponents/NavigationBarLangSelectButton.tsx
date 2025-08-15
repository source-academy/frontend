import { Position } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
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
import { useFeature } from 'src/commons/featureFlags/useFeature';
import { staticLanguageDirectoryProvider } from 'src/commons/languageDirectory/provider';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { flagLanguageDirectoryEnable } from 'src/features/languageDirectory/flagLanguageDirectory';
import LanguageDirectoryActions from 'src/features/languageDirectory/LanguageDirectoryActions';
import { playgroundConfigLanguage } from 'src/features/playground/PlaygroundActions';

function useDirectoryOptions(enabled: boolean) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const langs = await staticLanguageDirectoryProvider.getLanguages();
      if (cancelled) return;
      setOptions(langs.map(l => ({ value: l.id, label: l.name })));
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return options;
}

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDirLanguageId = useTypedSelector(s => s.languageDirectory.selectedLanguageId);
  const dispatch = useDispatch();
  const dirOptions = useDirectoryOptions(true);
  
  const directoryEnabled = useFeature(flagLanguageDirectoryEnable);
  if (!directoryEnabled) {
    return <LegacyNavigationBarLangSelectButton />;
  }

  const selectDirLanguage = (languageId: string) => {
    dispatch(LanguageDirectoryActions.setSelectedLanguage(languageId));
    setIsOpen(false);
  };

  return (
    <SimpleDropdown
      options={dirOptions}
      onClick={selectDirLanguage}
      selectedValue={selectedDirLanguageId ?? undefined}
      popoverProps={{ position: Position.BOTTOM_RIGHT, onClose: () => setIsOpen(false), isOpen }}
      buttonProps={{
        rightIcon: 'caret-down',
        onClick: () => setIsOpen(true),
        'data-testid': 'NavigationBarLangSelectButton'
      }}
    />
  );
};

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

export default NavigationBarLangSelectButton;
