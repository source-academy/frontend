import { Button } from '@blueprintjs/core';
import React, { useState } from 'react';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import { AchievementItem } from '../../../../../../features/achievement/AchievementTypes';
import PrerequisiteSwapper from './PrerequisiteSwapper';

type PrerequisitesPositionEditorProps = {
  editableAchievement: AchievementItem;
  inferencer: AchievementInferencer;
  saveChanges: any;
};

function PrerequisitePositionEditor(props: PrerequisitesPositionEditorProps) {
  const { editableAchievement, inferencer, saveChanges } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const prereqs = editableAchievement.prerequisiteIds;

  const [firstID, setFirstID] = useState<number>(prereqs.length === 0 ? 0 : prereqs[0]);
  const [secondID, setSecondID] = useState<number>(prereqs.length === 0 ? 0 : prereqs[0]);

  const swapAction = () => {
    const firstIndex = editableAchievement.prerequisiteIds.findIndex(id => id === firstID);
    const secondIndex = editableAchievement.prerequisiteIds.findIndex(id => id === secondID);

    const temp = editableAchievement.prerequisiteIds[firstIndex];
    editableAchievement.prerequisiteIds[firstIndex] =
      editableAchievement.prerequisiteIds[secondIndex];
    editableAchievement.prerequisiteIds[secondIndex] = temp;

    inferencer.modifyAchievement(editableAchievement);

    saveChanges();

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
