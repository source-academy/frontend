import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ItemListRenderer, type ItemRenderer, Select } from '@blueprintjs/select';
import type { IEvaluatorDefinition } from '@sourceacademy/language-directory/dist/types';
import { Chapter, Variant } from 'js-slang/dist/langs';
import { useAppDispatch } from 'src/commons/utils/Hooks';

import { useConductorEnable } from '../../features/conductor/flagConductorEnable';
import {
  CSE_EVALUATOR_CAPABILITY,
  STEPPER_EVALUATOR_CAPABILITY,
} from '../../features/conductor/stepperTab';
import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import type { SALanguage } from '../application/ApplicationTypes';
import { useAppSelector } from '../utils/Hooks';
import LegacyControlBarChapterSelect from './LegacyControlBarChapterSelect';

type Props = {
  handleChapterSelect?: (i: SALanguage, e?: React.SyntheticEvent<HTMLElement>) => void;
  isFolderModeEnabled: boolean;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  disabled?: boolean;
};

function ControlBarChapterSelect({
  isFolderModeEnabled,
  sourceChapter,
  sourceVariant,
  handleChapterSelect = () => {},
  disabled = false,
}: Props) {
  const dispatch = useAppDispatch();
  const directoryEnabled = useConductorEnable();
  const selectedLanguageId = useAppSelector(s => s.languageDirectory.selectedLanguageId);
  const selectedEvaluatorId = useAppSelector(s => s.languageDirectory.selectedEvaluatorId);
  const dirLanguages = useAppSelector(s => s.languageDirectory.languages);

  if (!directoryEnabled) {
    return (
      <LegacyControlBarChapterSelect
        isFolderModeEnabled={isFolderModeEnabled}
        sourceChapter={sourceChapter}
        sourceVariant={sourceVariant}
        handleChapterSelect={handleChapterSelect}
        disabled={disabled}
      />
    );
  }

  const currentLanguage = dirLanguages.find(l => l.id === selectedLanguageId);
  const evaluators = currentLanguage?.evaluators ?? [];
  // The stepper and CSE machine evaluators are hidden from the dropdown: each is reached only via its
  // own tab, which selects it automatically (see Playground). The button label still resolves against
  // the full list so it shows the true current evaluator (e.g. "Stepper"/"CSE") even while that entry
  // is unselectable.
  const selectableEvaluators = evaluators.filter(e => {
    const capabilities = e.capabilities as string[] | undefined;
    return (
      !capabilities?.includes(STEPPER_EVALUATOR_CAPABILITY) &&
      !capabilities?.includes(CSE_EVALUATOR_CAPABILITY)
    );
  });
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
