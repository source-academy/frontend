import React, { useState, useEffect } from 'react';
import { Button } from '@blueprintjs/core';

import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import AchievementTaskSelect from './AchievementTaskSelect';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';

type AchievementControlPanelPrerequisiteDeleterProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievementData: any;
  editAchievement: any;
};

function AchievementControlPanelPrerequisiteDeleter(
  props: AchievementControlPanelPrerequisiteDeleterProps
) {
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
    inferencer.getNextID(prerequisites)
  );

  useEffect(() => {
    setDeletedPrerequisiteID(inferencer.getNextID(prerequisites));
  }, [inferencer, prerequisites]);

  const deleteAction = (e: any) => {
    toggleDialogOpen();
    setEditableAchievement(deletePrerequisite(deletedPrerequisiteID));
    inferencer.editAchievement(editableAchievement);
    // TODO: add this
    // editAchievement(editableAchievement);
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

export default AchievementControlPanelPrerequisiteDeleter;
