import React, { useState, useEffect } from 'react';
import { Button } from '@blueprintjs/core';

import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import AchievementTaskSelect from './AchievementTaskSelect';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';

type AchievementControlPanelPrerequisiteAdderProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievementData: any;
  editAchievement: any;
};

function AchievementControlPanelPrerequisiteAdder(
  props: AchievementControlPanelPrerequisiteAdderProps
) {
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
    inferencer.getNextID(nonPrerequisites)
  );

  useEffect(() => {
    setAddedPrerequisiteID(inferencer.getNextID(nonPrerequisites));
  }, [inferencer, nonPrerequisites]);

  const addingAction = (e: any) => {
    toggleDialogOpen();
    setEditableAchievement(addPrerequisite(addedPrerequisiteID));
    inferencer.editAchievement(editableAchievement);
    // TODO: add this
    // editAchievement(editableAchievement);
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

export default AchievementControlPanelPrerequisiteAdder;
