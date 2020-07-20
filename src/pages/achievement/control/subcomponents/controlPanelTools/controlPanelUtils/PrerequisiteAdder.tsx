import { Button } from '@blueprintjs/core';
import React, { useState } from 'react';

import { AchievementItem } from '../../../../../../features/achievement/AchievementTypes';
import AchievementInferencer from '../../../../dashboard/subcomponents/utils/AchievementInferencer';
import AchievementSelection from './AchievementSelection';

type PrerequisiteAdderProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: AchievementInferencer;
  saveChanges: any;
};

function PrerequisiteAdder(props: PrerequisiteAdderProps) {
  const { editableAchievement, setEditableAchievement, inferencer, saveChanges } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const nonPrerequisites = inferencer.listAvailablePrerequisites(editableAchievement.id);

  const addPrerequisite = (prerequisiteID: number) => {
    const newAchievement = editableAchievement;
    newAchievement.prerequisiteIds.push(prerequisiteID);
    return newAchievement;
  };

  /**
   * If there are no more prerequisites to add to this achievement,
   * it will be set to a default value of 0.
   *
   * Else, it will always take the first available prerequisite id.
   */
  const [addedPrerequisiteID, setAddedPrerequisiteID] = useState<number>(
    nonPrerequisites.length === -1 ? 0 : nonPrerequisites[0]
  );

  // This actions adds a new prerequisite to the achievement.
  const addPrerequisiteAction = () => {
    setEditableAchievement(addPrerequisite(addedPrerequisiteID));
    inferencer.modifyAchievement(editableAchievement);

    saveChanges();

    toggleDialogOpen();
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Add A Prerequisite'} />
      <AchievementSelection
        selections={nonPrerequisites}
        inferencer={inferencer}
        selectedId={addedPrerequisiteID}
        setSelectedId={setAddedPrerequisiteID}
        buttonText={'Add Prerequisite'}
        dialogHeader={'Add A Prerequisite'}
        emptySelectionsMessage={'You have no more prerequisites to add'}
        toggleDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={addPrerequisiteAction}
      />
    </>
  );
}

export default PrerequisiteAdder;
