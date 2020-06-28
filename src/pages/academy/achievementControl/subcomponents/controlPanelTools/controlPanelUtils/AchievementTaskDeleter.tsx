import React from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';

type AchievementTaskDeleterProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievements: any;
  editAchievement: any;
};

function AchievementTaskDeleter(props: AchievementTaskDeleterProps) {
  const { editableAchievement, setEditableAchievement, inferencer, uploadAchievements } = props;

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
    uploadAchievements(inferencer.getAchievements);
  };

  return (
    <>
      <Button className="editor-button" onClick={deleteAction} text={'Delete This Task'} />
    </>
  );
}

export default AchievementTaskDeleter;
