import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';

import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import AchievementTaskSelector from './AchievementTaskSelector';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type AchievementPrerequisiteAdderProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function AchievementPrerequisiteAdder(props: AchievementPrerequisiteAdderProps) {
  const { editableAchievement, setEditableAchievement, inferencer, updateAchievements } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const nonPrerequisites = inferencer.listAvailablePrerequisites(editableAchievement.id);

  const addPrerequisite = (prerequisiteID: number) => {
    const newAchievement = editableAchievement;
    newAchievement.prerequisiteIds.push(prerequisiteID);
    return newAchievement;
  };

  const [addedPrerequisiteID, setAddedPrerequisiteID] = useState<number>(
    nonPrerequisites.length === 0 ? 0 : nonPrerequisites[0]
  );

  const addingAction = (e: any) => {
    toggleDialogOpen();
    setEditableAchievement(addPrerequisite(addedPrerequisiteID));
    inferencer.editAchievement(editableAchievement);
    updateAchievements(inferencer.getAchievements);
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Add A Prerequisite'} />
      <AchievementTaskSelector
        tasks={nonPrerequisites}
        inferencer={inferencer}
        focusTaskID={addedPrerequisiteID}
        setFocusTaskID={setAddedPrerequisiteID}
        buttonText={'Add Prerequisite'}
        dialogHeader={'Add A Prerequisite'}
        emptyTasksMessage={'You have no more prerequisites to add'}
        setDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={addingAction}
      />
    </>
  );
}

export default AchievementPrerequisiteAdder;
