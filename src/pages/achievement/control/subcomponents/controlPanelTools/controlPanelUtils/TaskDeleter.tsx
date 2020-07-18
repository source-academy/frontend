import { Button } from '@blueprintjs/core';
import React from 'react';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import { AchievementItem } from '../../../../../../commons/achievement/AchievementTypes';

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
