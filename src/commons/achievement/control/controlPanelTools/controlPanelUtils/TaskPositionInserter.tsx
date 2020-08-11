import { Button, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React, { useEffect, useState } from 'react';

import { AchievementItem } from '../../../../../features/achievement/AchievementTypes';
import AchievementInferencer from '../../../utils/AchievementInferencer';

type TaskPositionInserterProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: AchievementInferencer;
  saveChanges: any;
};

function TaskPositionInserter(props: TaskPositionInserterProps) {
  const { editableAchievement, setEditableAchievement, inferencer, saveChanges } = props;
  const [newPosition, setNewPosition] = useState<number>(editableAchievement.position);

  useEffect(() => {
    setEditableAchievement(inferencer.getAchievementItem(editableAchievement.id));
    setNewPosition(editableAchievement.position);
  }, [setEditableAchievement, inferencer, editableAchievement]);

  const changePosition = (position: number) => {
    setNewPosition(position);
  };

  const items = Array.from(
    Array(inferencer.listTaskIds().length),
    (_, taskInferencerId) => taskInferencerId + 1
  );

  const selectionsRenderer: ItemRenderer<number> = (position, { handleClick }) => {
    return <MenuItem active={false} key={position} onClick={handleClick} text={position} />;
  };

  const SelectionsComponent = Select.ofType<number>();

  const selectButton = (currentPosition: number) => {
    return <Button className="move-button" text={currentPosition} />;
  };

  const action = () => {
    inferencer.changePosition(editableAchievement, newPosition);
    saveChanges();
  };

  return (
    <div className="move-editor-buttons">
      <SelectionsComponent
        items={items}
        onItemSelect={changePosition}
        itemRenderer={selectionsRenderer}
        filterable={false}
      >
        {selectButton(newPosition)}
      </SelectionsComponent>
      <Button onClick={action} text={'Change Position'} disabled={false} />
    </div>
  );
}

export default TaskPositionInserter;
