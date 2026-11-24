import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ItemRenderer, Select } from '@blueprintjs/select';

import { useAppSelector } from '../utils/Hooks';

type LanguageChoice = { chapter: number; name: string };

type Props = {
  /** The deployment's language: a 1-based position in the language directory. */
  chapter: number;
  onSelect: (chapter: number) => void;
};

const renderLanguage: ItemRenderer<LanguageChoice> = (language, { handleClick }) => (
  <MenuItem active={false} key={language.chapter} onClick={handleClick} text={language.name} />
);

function DeploymentLanguageSelect({ chapter, onSelect }: Props) {
  const languages = useAppSelector(state => state.languageDirectory.languages);
  const choices = languages.map((language, index) => ({ chapter: index + 1, name: language.name }));

  return (
    <Select<LanguageChoice>
      className={Classes.MINIMAL}
      items={choices}
      onItemSelect={choice => onSelect(choice.chapter)}
      itemRenderer={renderLanguage}
      filterable={false}
    >
      <Button
        variant="minimal"
        text={languages[chapter - 1]?.name ?? 'Select a language'}
        endIcon={IconNames.DOUBLE_CARET_VERTICAL}
      />
    </Select>
  );
}

export default DeploymentLanguageSelect;
