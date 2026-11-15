import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ItemListRenderer, type ItemRenderer, Select } from '@blueprintjs/select';
import type { IEvaluatorDefinition } from '@sourceacademy/language-directory/dist/types';

import LanguageDirectoryActions from '../../../features/directory/LanguageDirectoryActions';
import { getSelectableEvaluators } from '../../../features/directory/languageFamily';
import { useAppDispatch, useAppSelector } from '../../utils/Hooks';

type Props = {
  disabled?: boolean;
};

function ControlBarRuntimeSelect({ disabled = false }: Props) {
  const dispatch = useAppDispatch();
  const selectedLanguageId = useAppSelector(s => s.languageDirectory.selectedLanguageId);
  const selectedEvaluatorId = useAppSelector(s => s.languageDirectory.selectedEvaluatorId);
  const languageMap = useAppSelector(s => s.languageDirectory.languageMap);

  const currentLanguage = selectedLanguageId ? languageMap[selectedLanguageId] : undefined;
  const runtimes = currentLanguage ? getSelectableEvaluators(currentLanguage) : [];
  // While a tool evaluator (e.g. the stepper) is active, its tab owns the selection, so show the
  // runtime a Run outside that tab would use.
  const selectedRuntime = runtimes.find(e => e.id === selectedEvaluatorId) ?? runtimes[0];
  const isDisabled = disabled || runtimes.length <= 1;

  const runtimeListRenderer: ItemListRenderer<IEvaluatorDefinition> = ({
    itemsParentRef,
    renderItem,
    items,
  }) => (
    <Menu ulRef={itemsParentRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(renderItem)}
    </Menu>
  );

  const runtimeRenderer: ItemRenderer<IEvaluatorDefinition> = (runtime, { handleClick }) => (
    <MenuItem key={runtime.id} onClick={handleClick} text={runtime.name} />
  );

  const onSelectRuntime = (runtime: IEvaluatorDefinition) => {
    dispatch(LanguageDirectoryActions.setSelectedEvaluator(runtime.id));
  };

  return (
    <Select<IEvaluatorDefinition>
      items={runtimes}
      onItemSelect={onSelectRuntime}
      itemRenderer={runtimeRenderer}
      itemListRenderer={runtimeListRenderer}
      filterable={false}
      disabled={isDisabled}
    >
      <Button
        variant="minimal"
        text={selectedRuntime ? selectedRuntime.name : 'Select Runtime'}
        endIcon={isDisabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
        data-testid="ControlBarRuntimeSelect"
        disabled={isDisabled}
      />
    </Select>
  );
}

export default ControlBarRuntimeSelect;
