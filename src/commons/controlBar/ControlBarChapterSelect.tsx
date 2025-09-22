import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { IEvaluatorDefinition } from '@sourceacademy/language-directory/dist/types';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';
import { useDispatch } from 'react-redux';

import { flagDirectoryLanguageEnable } from '../../features/directory/flagDirectoryLanguageEnable';
import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import { SALanguage } from '../application/ApplicationTypes';
import { useFeature } from '../featureFlags/useFeature';
import { useTypedSelector } from '../utils/Hooks';
import { LegacyControlBarChapterSelect } from './LegacyControlBarChapterSelect';

type ControlBarChapterSelectProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChapterSelect?: (i: SALanguage, e?: React.SyntheticEvent<HTMLElement>) => void;
};

type StateProps = {
  isFolderModeEnabled: boolean;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  disabled?: boolean;
};

export const ControlBarChapterSelect: React.FC<ControlBarChapterSelectProps> = ({
  isFolderModeEnabled,
  sourceChapter,
  sourceVariant,
  handleChapterSelect = () => {},
  disabled = false
}) => {
  const dispatch = useDispatch();
  const directoryEnabled = useFeature(flagDirectoryLanguageEnable);
  const selectedLanguageId = useTypedSelector(s => s.languageDirectory.selectedLanguageId);
  const selectedEvaluatorId = useTypedSelector(s => s.languageDirectory.selectedEvaluatorId);
  const dirLanguages = useTypedSelector(s => s.languageDirectory.languages);

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

  const EvaluatorSelectComponent = Select.ofType<IEvaluatorDefinition>();

  const currentLanguage = dirLanguages.find(l => l.id === selectedLanguageId);
  const evaluators = currentLanguage?.evaluators ?? [];
  const selectedEvaluator = evaluators.find(e => e.id === selectedEvaluatorId);

  const evaluatorListRenderer: ItemListRenderer<IEvaluatorDefinition> = ({
    itemsParentRef,
    renderItem,
    items
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
    <EvaluatorSelectComponent
      items={evaluators}
      onItemSelect={onSelectEvaluator}
      itemRenderer={evaluatorRenderer}
      itemListRenderer={evaluatorListRenderer}
      filterable={false}
      disabled={disabled}
    >
      <Button
        minimal
        text={selectedEvaluator ? selectedEvaluator.name : 'Select Evaluator'}
        rightIcon={disabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
        data-testid="ControlBarEvaluatorSelect"
        disabled={disabled}
      />
    </EvaluatorSelectComponent>
  );
};
