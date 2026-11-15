import { Position } from '@blueprintjs/core';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useAppDispatch, useAppSelector } from 'src/commons/utils/Hooks';
import { useConductorEnable } from 'src/features/conductor/flagConductorEnable';
import { deriveLanguageFromChapter } from 'src/features/directory/chapterLanguage';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import {
  getLanguageFamily,
  groupLanguagesByFamily,
  pickVariantForFamily,
} from 'src/features/directory/languageFamily';

//TODO <remove legacy>: Remove when conductors.languageDirectory is default behaviour
import LegacyNavigationBarLangSelectButton from './LegacyNavigationBarLangSelectButton';

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDirLanguageId = useAppSelector(s => s.languageDirectory.selectedLanguageId);
  const languages = useAppSelector(s => s.languageDirectory.languages);
  const languageMap = useAppSelector(s => s.languageDirectory.languageMap);
  const courseSourceChapter = useAppSelector(s => s.session.sourceChapter);

  const dispatch = useAppDispatch();
  const familyOptions = groupLanguagesByFamily(languages).map(f => ({
    value: f.name,
    label: f.name,
  }));
  const selectedLanguage = selectedDirLanguageId ? languageMap[selectedDirLanguageId] : undefined;
  const selectedFamily = selectedLanguage ? getLanguageFamily(selectedLanguage) : undefined;
  const isSingleFamily = familyOptions.length <= 1;
  const location = useLocation();
  const navigate = useNavigate();

  const directoryEnabled = useConductorEnable();
  if (!directoryEnabled) {
    return <LegacyNavigationBarLangSelectButton />;
  }

  const selectFamily = (family: string) => {
    setIsOpen(false);
    if (family === selectedFamily) {
      return;
    }
    const courseDefaultId = deriveLanguageFromChapter(languages, courseSourceChapter)?.languageId;
    const newLang = pickVariantForFamily(languages, family, courseDefaultId);
    if (!newLang) {
      return;
    }
    dispatch(LanguageDirectoryActions.setSelectedLanguage(newLang.id));

    const isInTextbook =
      location.pathname.startsWith('/sicpjs') || location.pathname.startsWith('/sicpy');
    if (isInTextbook) {
      if (newLang.textbook) {
        navigate(`${newLang.textbook.route}/index`);
      } else {
        navigate('/playground');
      }
    }
  };

  return (
    <SimpleDropdown
      options={familyOptions}
      onClick={selectFamily}
      selectedValue={selectedFamily}
      popoverProps={{ position: Position.BOTTOM_RIGHT, onClose: () => setIsOpen(false), isOpen }}
      buttonProps={{
        endIcon: isSingleFamily ? undefined : 'caret-down',
        disabled: isSingleFamily,
        onClick: () => setIsOpen(true),
        'data-testid': 'NavigationBarLangSelectButton',
      }}
    />
  );
};

export default NavigationBarLangSelectButton;
