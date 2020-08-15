import { Button, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React, { useState } from 'react';
import { GoalMeta, GoalType } from 'src/features/achievement/AchievementTypes';

type EditableMetaProps = {
  meta: GoalMeta;
  changeMeta: (meta: GoalMeta) => void;
};

function EditableMeta(props: EditableMetaProps) {
  const { meta } = props;

  const [goalType, setGoalType] = useState<GoalType>(meta.type);

  const GoalTypeSelect = Select.ofType<GoalType>();
  const goalTypeRenderer: ItemRenderer<GoalType> = (type, { handleClick }) => (
    <MenuItem key={type} onClick={handleClick} text={type} />
  );

  return (
    <GoalTypeSelect
      items={Object.values(GoalType)}
      onItemSelect={setGoalType}
      itemRenderer={goalTypeRenderer}
      filterable={false}
    >
      <Button text={goalType} />
    </GoalTypeSelect>
  );
}

export default EditableMeta;
