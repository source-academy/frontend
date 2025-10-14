import { Position } from '@blueprintjs/core';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFeature } from 'src/commons/featureFlags/useFeature';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { flagDirectoryLanguageEnable } from 'src/features/directory/flagDirectoryLanguageEnable';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';

//TODO <remove legacy>: Remove when conductors.languageDirectory is default behaviour
import LegacyNavigationBarLangSelectButton from './LegacyNavigationBarLangSelectButton';

function useDirectoryOptions() {
  const langs = useTypedSelector(s => s.languageDirectory.languages);
  return langs.map(l => ({ value: l.id, label: l.name }));
}

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDirLanguageId = useTypedSelector(s => s.languageDirectory.selectedLanguageId);

  const dispatch = useDispatch();
  const dirOptions = useDirectoryOptions();

  const directoryEnabled = useFeature(flagDirectoryLanguageEnable);
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

export default NavigationBarLangSelectButton;
