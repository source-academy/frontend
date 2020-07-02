import React, { useEffect } from 'react';
import { Button } from '@blueprintjs/core';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';

type TaskPositionEditorProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  saveChanges: any;
};

function TaskPositionEditor(props: TaskPositionEditorProps) {
  const { editableAchievement, setEditableAchievement, inferencer, saveChanges } = props;

  useEffect(() => {
    setEditableAchievement(inferencer.getAchievementItem(editableAchievement.id));
  }, [setEditableAchievement, inferencer, editableAchievement]);

  const taskIDs = inferencer.listTaskIds();
  const ind = editableAchievement.position;

  const switchWithPreviousTask = () => {
    if (ind !== 1) {
      inferencer.swapAchievementPositions(
        editableAchievement,
        inferencer.getAchievementItem(taskIDs[ind - 2])
      );

      saveChanges();
    }
  };

  const switchWithNextTask = () => {
    if (ind !== taskIDs.length) {
      inferencer.swapAchievementPositions(
        editableAchievement,
        inferencer.getAchievementItem(taskIDs[ind])
      );

      saveChanges();
    }
  };

  return (
    <div className="move-editor-buttons">
      <Button
        className="move-button"
        onClick={switchWithPreviousTask}
        text={'Move Up'}
        disabled={ind === 1}
      />

      <Button
        className="move-button"
        onClick={switchWithNextTask}
        text={'Move Down'}
        disabled={ind === taskIDs.length}
      />
    </div>
  );
}

export default TaskPositionEditor;
