import { Position } from '@blueprintjs/core';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useAppDispatch, useAppSelector } from 'src/commons/utils/Hooks';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import { isTextbookPath } from 'src/features/textbook/textbooks';

function useDirectoryOptions() {
  const langs = useAppSelector(s => s.languageDirectory.languages);
  return langs.map(l => ({ value: l.id, label: l.name }));
}

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDirLanguageId = useAppSelector(s => s.languageDirectory.selectedLanguageId);
  const languageMap = useAppSelector(s => s.languageDirectory.languageMap);
  const languages = useAppSelector(s => s.languageDirectory.languages);

  const dispatch = useAppDispatch();
  const dirOptions = useDirectoryOptions();
  const location = useLocation();
  const navigate = useNavigate();

  const selectDirLanguage = (languageId: string) => {
    dispatch(LanguageDirectoryActions.setSelectedLanguage(languageId));
    setIsOpen(false);

    if (isTextbookPath(languages, location.pathname)) {
      const newLang = languageMap[languageId];
      if (newLang?.textbook) {
        navigate(`${newLang.textbook.route}/index`);
      } else {
        navigate('/playground');
      }
    }
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
