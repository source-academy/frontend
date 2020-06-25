import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementTaskSelect from './AchievementTaskSelect';
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';

// TODO: Rename to PrerequisireAdder

type AchievementControlPanelAdderProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievementData: any;
};

function AchievementControlPanelAdder(props: AchievementControlPanelAdderProps) {
  const { editableAchievement, setEditableAchievement, inferencer, uploadAchievementData } = props;

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
    uploadAchievementData(inferencer.getAchievementData);
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Add A Prerequisite'} />
      <AchievementTaskSelect
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

export default AchievementControlPanelAdder;
