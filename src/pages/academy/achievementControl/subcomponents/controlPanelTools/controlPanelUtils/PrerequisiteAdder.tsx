import { Button } from '@blueprintjs/core';
import React, { useState } from 'react';
import Inferencer from 'src/pages/achievements/dashboard/subcomponents/utils/Inferencer';

import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';
import AchievementSelector from './AchievementSelector';

type PrerequisiteAdderProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
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

  const [addedPrerequisiteID, setAddedPrerequisiteID] = useState<number>(
    nonPrerequisites.length === 0 ? 0 : nonPrerequisites[0]
  );

  const addAction = () => {
    setEditableAchievement(addPrerequisite(addedPrerequisiteID));
    inferencer.modifyAchievement(editableAchievement);

    saveChanges();

    toggleDialogOpen();
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
