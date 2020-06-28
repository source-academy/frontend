import React from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';

type AchievementTaskDeleterProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievementData: any;
  editAchievement: any;
};

function AchievementTaskDeleter(props: AchievementTaskDeleterProps) {
  const { editableAchievement, setEditableAchievement, inferencer, uploadAchievementData } = props;

  const setNonTask = () => {
    const newAchievement = editableAchievement;
    newAchievement.prerequisiteIds = [];
    newAchievement.isTask = false;
    return newAchievement;
  };

  const deleteAction = (e: any) => {
    setEditableAchievement(setNonTask());
    inferencer.editAchievement(editableAchievement);
    // TODO: add this
    // editAchievement(editableAchievement);
    uploadAchievementData(inferencer.getAchievementData);
  };

  return (
    <>
      <Button className="editor-button" onClick={deleteAction} text={'Delete This Task'} />
    </>
  );
}

export default AchievementTaskDeleter;
