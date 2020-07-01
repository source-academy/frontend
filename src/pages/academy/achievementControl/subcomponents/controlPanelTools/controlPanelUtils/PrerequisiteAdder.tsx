import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';

import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import PopupSelector from './PopupSelector';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type PrerequisiteAdderProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function PrerequisiteAdder(props: PrerequisiteAdderProps) {
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
    // TODO: forceRefresh() here
    updateAchievements(inferencer.getAchievements);
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Add A Prerequisite'} />
      <PopupSelector
        selectionIds={nonPrerequisites}
        inferencer={inferencer}
        dialogHeader={'Add A Prerequisite'}
        focusId={addedPrerequisiteID}
        setFocusId={setAddedPrerequisiteID}
        buttonText={'Add Prerequisite'}
        emptySelectionMessage={'You have no more prerequisites to add'}
        isDialogOpen={isDialogOpen}
        toggleDialogOpen={toggleDialogOpen}
        action={addingAction}
      />
    </>
  );
}

export default PrerequisiteAdder;
