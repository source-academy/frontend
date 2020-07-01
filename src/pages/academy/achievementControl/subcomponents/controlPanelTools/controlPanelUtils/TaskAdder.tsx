import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import PopupSelector from './PopupSelector';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

export type TaskAdderProps = {
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function TaskAdder(props: TaskAdderProps) {
  const { inferencer, updateAchievements } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const nonTaskIDs = inferencer.listNonTaskIds();

  const [addedTaskID, setAddedTaskID] = useState<number>(
    nonTaskIDs.length === 0 ? 0 : nonTaskIDs[0]
  );

  const addNewTask = () => {
    const achievement = inferencer.getAchievementItem(addedTaskID);
    inferencer.setTaskAchievement(achievement);
    updateAchievements(inferencer.getAchievements());
  };

  const addingAction = (e: any) => {
    toggleDialogOpen();
    addNewTask();
  };

  return (
    <>
      <Button className="main-adder" onClick={toggleDialogOpen} text={'Add A Task'} />
      <PopupSelector
        selectionIds={nonTaskIDs}
        inferencer={inferencer}
        focusId={addedTaskID}
        setFocusId={setAddedTaskID}
        buttonText={'Add Task'}
        dialogHeader={'Add A Task'}
        emptySelectionMessage={'You have no more tasks to add'}
        toggleDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={addingAction}
      />
    </>
  );
}

export default TaskAdder;
