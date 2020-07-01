import React from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type TaskDeleterProps = {
  editableAchievement: AchievementItem;
  inferencer: Inferencer;
  updateAchievements: any;
};

function TaskDeleter(props: TaskDeleterProps) {
  const { editableAchievement, inferencer, updateAchievements } = props;

  const deleteAction = () => {
    inferencer.setNonTask(editableAchievement);
    updateAchievements(inferencer.getAchievements);
  };

  return (
    <>
      <Button className="editor-button" onClick={deleteAction} text={'Delete This Task'} />
    </>
  );
}

export default TaskDeleter;
