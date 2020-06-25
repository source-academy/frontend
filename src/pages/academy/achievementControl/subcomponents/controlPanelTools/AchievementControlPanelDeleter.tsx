import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import AchievementTaskSelect from './AchievementTaskSelect';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';

type AchievementControlPanelDeleterProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievementData: any;
};

function AchievementControlPanelDeleter(props: AchievementControlPanelDeleterProps) {
  const { editableAchievement, setEditableAchievement, inferencer, uploadAchievementData } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const prerequisites = editableAchievement.prerequisiteIds;

  const deletePrerequisite = (prerequisiteID: number) => {
    const newAchievement = editableAchievement;

    for (let i = 0; i < newAchievement.prerequisiteIds.length; i++) {
      if (newAchievement.prerequisiteIds[i] === prerequisiteID) {
        newAchievement.prerequisiteIds.splice(i, 1);
      }
    }

    return newAchievement;
  };

  const [deletedPrerequisiteID, setDeletedPrerequisiteID] = useState<number>(
    prerequisites.length === 0 ? 0 : prerequisites[0]
  );

  const deleteAction = (e: any) => {
    toggleDialogOpen();
    setEditableAchievement(deletePrerequisite(deletedPrerequisiteID));
    inferencer.editAchievement(editableAchievement);
    uploadAchievementData(inferencer.getAchievementData);
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Delete A Prerequisite'} />
      <AchievementTaskSelect
        tasks={prerequisites}
        inferencer={inferencer}
        focusTaskID={deletedPrerequisiteID}
        setFocusTaskID={setDeletedPrerequisiteID}
        buttonText={'Delete Prerequisite'}
        dialogHeader={'Delete A Prerequisite'}
        emptyTasksMessage={'You have no more prerequisites to delete'}
        setDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={deleteAction}
      />
    </>
  );
}

export default AchievementControlPanelDeleter;

/*

  return (
    <>
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag(flag)}
        text={'Delete A Prerequisite'}
      />
      <AchievementTaskSelect
        tasks={prerequisites}
        focusTaskID={deletedPrerequisiteID}
        setFocusTaskID={setDeletedPrerequisiteID}
        buttonText={'Delete Prerequisite'}
        dialogHeader={'Delete A Prerequisite'}
        emptyTasksMessage={'You have no more prerequisites to delete'}
        setDialogOpen={() => toggleDialogFlag(flag)}
        isDialogOpen={isDialogOpen}
        action={deleteAction}
      />
    </>
  );

*/
