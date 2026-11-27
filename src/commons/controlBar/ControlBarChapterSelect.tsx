import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ItemListRenderer, type ItemRenderer, Select } from '@blueprintjs/select';
import type { IEvaluatorDefinition } from '@sourceacademy/language-directory/dist/types';
import { useAppDispatch } from 'src/commons/utils/Hooks';

import { isToolEvaluator } from '../../features/conductor/toolEvaluators';
import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import { useAppSelector } from '../utils/Hooks';

type Props = {
  disabled?: boolean;
};

function ControlBarChapterSelect({ disabled = false }: Props) {
  const dispatch = useAppDispatch();
  const selectedLanguageId = useAppSelector(s => s.languageDirectory.selectedLanguageId);
  const selectedEvaluatorId = useAppSelector(s => s.languageDirectory.selectedEvaluatorId);
  const dirLanguages = useAppSelector(s => s.languageDirectory.languages);

  const currentLanguage = dirLanguages.find(l => l.id === selectedLanguageId);
  const evaluators = currentLanguage?.evaluators ?? [];
  // Tool evaluators (those a plugin tab belongs to) are hidden from the dropdown: each is reached only via its
  // own tab, which selects it automatically (see Playground). The button label still resolves against
  // the full list so it shows the true current evaluator (e.g. a tool's) even while that entry
  // is unselectable.
  const selectableEvaluators = evaluators.filter(e => !isToolEvaluator(e));
  const selectedEvaluator = evaluators.find(e => e.id === selectedEvaluatorId);

  const evaluatorListRenderer: ItemListRenderer<IEvaluatorDefinition> = ({
    itemsParentRef,
    renderItem,
    items,
  }) => (
    <Menu ulRef={itemsParentRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(renderItem)}
    </Menu>
  );

  const evaluatorRenderer: ItemRenderer<IEvaluatorDefinition> = (evaluator, { handleClick }) => (
    <MenuItem key={evaluator.id} onClick={handleClick} text={evaluator.name} />
  );

  const onSelectEvaluator = (evaluator: IEvaluatorDefinition) => {
    dispatch(LanguageDirectoryActions.setSelectedEvaluator(evaluator.id));
  };

  return (
    <Select<IEvaluatorDefinition>
      items={selectableEvaluators}
      onItemSelect={onSelectEvaluator}
      itemRenderer={evaluatorRenderer}
      itemListRenderer={evaluatorListRenderer}
      filterable={false}
      disabled={disabled}
    >
      <Button
        variant="minimal"
        text={selectedEvaluator ? selectedEvaluator.name : 'Select Evaluator'}
        endIcon={disabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
        data-testid="ControlBarEvaluatorSelect"
        disabled={disabled}
      />
    </Select>
  );
}

export default ControlBarChapterSelect;
