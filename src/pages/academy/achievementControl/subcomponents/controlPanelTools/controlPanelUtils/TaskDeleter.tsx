import { Button } from '@blueprintjs/core';
import React from 'react';
import Inferencer from 'src/pages/achievements/dashboard/subcomponents/utils/Inferencer';

import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';

type TaskDeleterProps = {
  editableAchievement: AchievementItem;
  inferencer: Inferencer;
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
