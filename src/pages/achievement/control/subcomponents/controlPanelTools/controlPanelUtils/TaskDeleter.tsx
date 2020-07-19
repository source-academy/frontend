import { Button } from '@blueprintjs/core';
import React from 'react';

import { AchievementItem } from '../../../../../../features/achievement/AchievementTypes';
import AchievementInferencer from '../../../../dashboard/subcomponents/utils/AchievementInferencer';

type TaskDeleterProps = {
  editableAchievement: AchievementItem;
  inferencer: AchievementInferencer;
  saveChanges: any;
};

function TaskDeleter(props: TaskDeleterProps) {
  const { editableAchievement, inferencer, saveChanges } = props;

  const deleteAction = () => {
    inferencer.setNonTask(editableAchievement);

    saveChanges();
  };

  return (
    <>
      <Button className="editor-button" onClick={deleteAction} text={'Delete This Task'} />
    </>
  );
}

export default TaskDeleter;
