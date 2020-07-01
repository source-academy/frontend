import React, { useState } from 'react';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';
import { Button } from '@blueprintjs/core';
import PrerequisiteSwapper from './PrerequisiteSwapper';

type PrerequisitePositionEditorProps = {
  editableAchievement: AchievementItem;
  inferencer: Inferencer;
  updateAchievements: any;
};

function PrerequisitePositionEditor(props: PrerequisitePositionEditorProps) {
  const { editableAchievement, inferencer, updateAchievements } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const prereqs = editableAchievement.prerequisiteIds;

  const [firstID, setFirstID] = useState<number>(prereqs.length === 0 ? 0 : prereqs[0]);
  const [secondID, setSecondID] = useState<number>(prereqs.length === 0 ? 0 : prereqs[0]);

  const swapAction = (e: any) => {
    const firstIndex = editableAchievement.prerequisiteIds.findIndex(id => id === firstID);
    const secondIndex = editableAchievement.prerequisiteIds.findIndex(id => id === secondID);

    const temp = editableAchievement.prerequisiteIds[firstIndex];
    editableAchievement.prerequisiteIds[firstIndex] =
      editableAchievement.prerequisiteIds[secondIndex];
    editableAchievement.prerequisiteIds[secondIndex] = temp;

    inferencer.editAchievement(editableAchievement);
    updateAchievements(inferencer.getAchievements());

    toggleDialogOpen();
  };

  return (
    <>
      <Button
        className="editor-button"
        onClick={toggleDialogOpen}
        text={'Change Prerequisite Pos'}
      />
      <PrerequisiteSwapper
        prerequisiteIdDs={prereqs}
        inferencer={inferencer}
        setDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={swapAction}
        firstID={firstID}
        setFirstID={setFirstID}
        secondID={secondID}
        setSecondID={setSecondID}
      />
    </>
  );
}

export default PrerequisitePositionEditor;
