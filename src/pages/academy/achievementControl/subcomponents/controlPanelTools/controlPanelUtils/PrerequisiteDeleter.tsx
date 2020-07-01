import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';

import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import AchievementSelector from './AchievementSelector';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type PrerequisiteDeleterProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  updateAchievements: any;
};

function PrerequisiteDeleter(props: PrerequisiteDeleterProps) {
  const { editableAchievement, setEditableAchievement, inferencer, updateAchievements } = props;

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
    updateAchievements(inferencer.getAchievements);
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Delete A Prerequisite'} />
      <AchievementSelector
        selections={prerequisites}
        inferencer={inferencer}
        selectedId={deletedPrerequisiteID}
        setSelectedId={setDeletedPrerequisiteID}
        buttonText={'Delete Prerequisite'}
        dialogHeader={'Delete A Prerequisite'}
        emptySelectionsMessage={'You have no more prerequisites to delete'}
        toggleDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={deleteAction}
      />
    </>
  );
}

export default PrerequisiteDeleter;
