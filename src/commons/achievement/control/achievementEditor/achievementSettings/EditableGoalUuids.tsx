import { MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, MultiSelect } from '@blueprintjs/select';
import { without } from 'lodash';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { AchievementGoal } from 'src/features/achievement/AchievementTypes';

type Props = {
  changeGoalUuids: (goalUuids: string[]) => void;
  goalUuids: string[];
};

const EditableGoalUuids: React.FC<Props> = ({ changeGoalUuids, goalUuids }) => {
  const inferencer = useContext(AchievementContext);
  const allGoalUuids = inferencer.getAllGoalUuids();
  const selectedUuids = goalUuids.filter(
    uuid => !inferencer.isInvalidGoal(inferencer.getGoal(uuid))
  );

  const getUuid = (text: string) => inferencer.getUuidByText(text);

  const GoalSelect = MultiSelect.ofType<AchievementGoal>();
  const goalRenderer: ItemRenderer<AchievementGoal> = (goal, { handleClick }) => (
    <MenuItem key={goal.uuid} onClick={handleClick} text={goal.text} />
  );
  const goalPredicate: ItemPredicate<AchievementGoal> = (query, item) =>
    item.text.toLowerCase().includes(query.toLowerCase());

  const selectedGoals = new Set(selectedUuids);
  const availableGoals = new Set(without(allGoalUuids, ...goalUuids));

  const selectGoal = (selectUuid: string) => {
    selectedGoals.add(selectUuid);
    availableGoals.delete(selectUuid);
    changeGoalUuids([...selectedGoals]);
  };

  const removeGoal = (removeUuid?: string) => {
    if (removeGoal === undefined) return;

    selectedGoals.delete(removeUuid!);
    availableGoals.add(removeUuid!);
    changeGoalUuids([...selectedGoals]);
  };

  return (
    <GoalSelect
      itemRenderer={goalRenderer}
      items={[...availableGoals].map(uuid => inferencer.getGoal(uuid))}
      noResults={<MenuItem disabled={true} text="No available goal" />}
      onItemSelect={goal => selectGoal(goal.uuid)}
      selectedItems={[...selectedGoals].map(uuid => inferencer.getGoal(uuid))}
      tagInputProps={{ onRemove: text => removeGoal(getUuid(text!.toString())) }}
      tagRenderer={goal => goal.text}
      itemPredicate={goalPredicate}
      resetOnSelect={true}
    />
  );
};

export default EditableGoalUuids;
