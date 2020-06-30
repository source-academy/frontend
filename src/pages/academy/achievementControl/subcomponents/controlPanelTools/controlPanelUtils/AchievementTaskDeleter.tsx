import React from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';

type AchievementTaskDeleterProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function AchievementTaskDeleter(props: AchievementTaskDeleterProps) {
  const { editableAchievement, inferencer, updateAchievements } = props;

  const deleteAction = (e: any) => {
    inferencer.setNonTaskAchievement(editableAchievement);
    updateAchievements(inferencer.getAchievements);
  };

  return (
    <>
      <Button className="editor-button" onClick={deleteAction} text={'Delete This Task'} />
    </>
  );
}

export default AchievementTaskDeleter;
