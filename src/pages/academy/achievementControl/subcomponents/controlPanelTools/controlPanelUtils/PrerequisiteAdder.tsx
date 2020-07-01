import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';

import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import AchievementSelector from './AchievementSelector';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type PrerequisiteAdderProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  updateAchievements: any;
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

  const addAction = () => {
    toggleDialogOpen();
    setEditableAchievement(addPrerequisite(addedPrerequisiteID));
    inferencer.editAchievement(editableAchievement);
    updateAchievements(inferencer.getAchievements);
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Add A Prerequisite'} />
      <AchievementSelector
        selections={nonPrerequisites}
        inferencer={inferencer}
        selectedId={addedPrerequisiteID}
        setSelectedId={setAddedPrerequisiteID}
        buttonText={'Add Prerequisite'}
        dialogHeader={'Add A Prerequisite'}
        emptySelectionsMessage={'You have no more prerequisites to add'}
        toggleDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={addAction}
      />
    </>
  );
}

export default PrerequisiteAdder;
