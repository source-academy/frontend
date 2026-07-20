import { Position } from '@blueprintjs/core';
import { useState } from 'react';
import { useFeature } from 'src/commons/featureFlags/useFeature';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useAppDispatch, useAppSelector } from 'src/commons/utils/Hooks';
import { flagConductorEnable } from 'src/features/conductor/flagConductorEnable';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';

//TODO <remove legacy>: Remove when conductors.languageDirectory is default behaviour
import LegacyNavigationBarLangSelectButton from './LegacyNavigationBarLangSelectButton';

function useDirectoryOptions() {
  const langs = useAppSelector(s => s.languageDirectory.languages);
  return langs.map(l => ({ value: l.id, label: l.name }));
}

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDirLanguageId = useAppSelector(s => s.languageDirectory.selectedLanguageId);

  const dispatch = useAppDispatch();
  const dirOptions = useDirectoryOptions();

  const directoryEnabled = useFeature(flagConductorEnable);
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
        endIcon: 'caret-down',
        onClick: () => setIsOpen(true),
        'data-testid': 'NavigationBarLangSelectButton',
      }}
    />
  );
};

export default NavigationBarLangSelectButton;
