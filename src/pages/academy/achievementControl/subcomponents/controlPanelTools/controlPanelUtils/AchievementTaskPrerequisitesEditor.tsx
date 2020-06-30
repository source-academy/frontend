import React, { useState } from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';
import { Button } from '@blueprintjs/core';
import AchievementPrerequisiteSwapper from './AchievementPrerequisiteSwapper';

type AchievementTaskPrerequisitesEditorProps = {
  editableAchievement: AchievementItem;
  inferencer: Inferencer;
  updateAchievements: any;
};

function AchievementTaskPrerequisitesEditor(props: AchievementTaskPrerequisitesEditorProps) {
  const { editableAchievement, inferencer, updateAchievements } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const prereqs = editableAchievement.prerequisiteIds;
  console.log(prereqs);

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
      <AchievementPrerequisiteSwapper
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

export default AchievementTaskPrerequisitesEditor;
