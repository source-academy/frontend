import { Button } from '@blueprintjs/core';
import React from 'react';

import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

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
