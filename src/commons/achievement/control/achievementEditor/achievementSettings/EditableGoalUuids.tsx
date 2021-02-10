import { MenuItem } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect } from '@blueprintjs/select';
import { without } from 'lodash';
import { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

type EditableGoalUuidsProps = {
  changeGoalUuids: (goalUuids: number[]) => void;
  goalUuids: number[];
};

function EditableGoalUuids(props: EditableGoalUuidsProps) {
  const { changeGoalUuids, goalUuids } = props;

  const inferencer = useContext(AchievementContext);
  const allGoalUuids = inferencer.getAllGoalUuids();
  const getUuid = (text: string) => inferencer.getUuidByText(text);
  const getText = (uuid: number) => inferencer.getTextByUuid(uuid);

  const GoalSelect = MultiSelect.ofType<number>();
  const goalRenderer: ItemRenderer<number> = (uuid, { handleClick }) => (
    <MenuItem key={uuid} onClick={handleClick} text={getText(uuid)} />
  );

  const selectedGoals = new Set(goalUuids);
  const availableGoals = new Set(without(allGoalUuids, ...goalUuids));

  const selectGoal = (selectUuid: number) => {
    selectedGoals.add(selectUuid);
    availableGoals.delete(selectUuid);
    changeGoalUuids([...selectedGoals]);
  };

  const removeGoal = (removeUuid?: number) => {
    if (removeUuid === undefined) return;

    selectedGoals.delete(removeUuid);
    availableGoals.add(removeUuid);
    changeGoalUuids([...selectedGoals]);
  };

  return (
    <GoalSelect
      itemRenderer={goalRenderer}
      items={[...availableGoals]}
      noResults={<MenuItem disabled={true} text="No available goal" />}
      onItemSelect={selectGoal}
      selectedItems={[...selectedGoals]}
      tagInputProps={{ onRemove: text => removeGoal(getUuid(text!.toString())) }}
      tagRenderer={getText}
    />
  );
}

export default EditableGoalUuids;
