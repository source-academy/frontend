import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import AchievementTaskSelect from './AchievementTaskSelect';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';

export type AchievementControlPanelTaskAdderProps = {
  inferencer: Inferencer;
  uploadAchievementData: any;
};

function AchievementControlPanelTaskAdder(props: AchievementControlPanelTaskAdderProps) {
  const { inferencer, uploadAchievementData } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const nonTaskIDs = inferencer.listNonTaskIds();

  const [addedTaskID, setAddedTaskID] = useState<number>(
    nonTaskIDs.length === 0 ? 0 : nonTaskIDs[0]
  );

  const addNewTask = () => {
    const achievement = inferencer.getAchievementItem(addedTaskID);
    achievement.isTask = true;
    inferencer.editAchievement(achievement);
    uploadAchievementData(inferencer.getAchievementData);
  };

  const addingAction = (e: any) => {
    toggleDialogOpen();
    addNewTask();
  };

  return (
    <>
      <Button className="main-adder" onClick={toggleDialogOpen} text={'Add A Task'} />
      <AchievementTaskSelect
        tasks={nonTaskIDs}
        inferencer={inferencer}
        focusTaskID={addedTaskID}
        setFocusTaskID={setAddedTaskID}
        buttonText={'Add Task'}
        dialogHeader={'Add A Task'}
        emptyTasksMessage={'You have no more tasks to add'}
        setDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={addingAction}
      />
    </>
  );
}

export default AchievementControlPanelTaskAdder;
