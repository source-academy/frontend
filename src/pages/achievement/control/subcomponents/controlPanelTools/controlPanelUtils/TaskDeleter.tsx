import { Button } from '@blueprintjs/core';
import React from 'react';

import { AchievementItem } from '../../../../../../features/achievement/AchievementTypes';
import AchievementInferencer from '../../../../dashboard/subcomponents/utils/AchievementInferencer';

type TaskDeleterProps = {
  editableAchievement: AchievementItem;
  inferencer: AchievementInferencer;
  saveChanges: any;
};

/**
 * This components removes an achievement from the list of tasks
 * a student needs to complete.
 *
 * Note that it DOES NOT remove an achievement from the list
 * of achievements available.
 */
function TaskDeleter(props: TaskDeleterProps) {
  const { editableAchievement, inferencer, saveChanges } = props;

  // This will set this achivement to be removed
  // from the list of tasks.
  const setNonTaskAction = () => {
    inferencer.setNonTask(editableAchievement);

    saveChanges();
  };

  return (
    <>
      <Button className="editor-button" onClick={setNonTaskAction} text={'Delete This Task'} />
    </>
  );
}

export default TaskDeleter;
