import { MenuItem } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect } from '@blueprintjs/select';
import { without } from 'lodash';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

type EditableGoalIdsProps = {
  allGoalIds: number[];
  changeGoalIds: (goalIds: number[]) => void;
  goalIds: number[];
};

function EditableGoalIds(props: EditableGoalIdsProps) {
  const { allGoalIds, changeGoalIds, goalIds } = props;

  const inferencer = useContext(AchievementContext);
  const getId = inferencer.getIdByText;
  const getText = (id: number) => inferencer.getGoalDefinition(id).text;

  const GoalSelect = MultiSelect.ofType<number>();
  const goalRenderer: ItemRenderer<number> = (id, { handleClick }) => (
    <MenuItem key={id} onClick={handleClick} text={getText(id)} />
  );

  const selectedGoals = new Set(goalIds);
  const availableGoals = new Set(without(allGoalIds, ...goalIds));

  const handleSelectGoal = (selectId: number) => {
    selectedGoals.add(selectId);
    availableGoals.delete(selectId);
    changeGoalIds([...selectedGoals]);
  };

  const handleRemoveGoal = (removeId: number) => {
    selectedGoals.delete(removeId);
    availableGoals.add(removeId);
    changeGoalIds([...selectedGoals]);
  };

  return (
    <GoalSelect
      itemRenderer={goalRenderer}
      items={[...availableGoals]}
      noResults={<MenuItem disabled={true} text="No available goal" />}
      onItemSelect={handleSelectGoal}
      selectedItems={[...selectedGoals]}
      tagInputProps={{ onRemove: text => handleRemoveGoal(getId(text)) }}
      tagRenderer={getText}
    />
  );
}

export default EditableGoalIds;
