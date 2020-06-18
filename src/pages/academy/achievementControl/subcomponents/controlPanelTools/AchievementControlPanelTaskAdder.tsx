import React, { useState } from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { Button } from '@blueprintjs/core';
import AchievementTaskSelect from './AchievementTaskSelect';

export type AchievementControlPanelTaskAdderProps = {
  achievementItems: { [id: number]: AchievementItem };
  setAchievementItems: any;
  resetCurrentTasks: any;
  pendingTasks: AchievementItem[];
};

function AchievementControlPanelTaskAdder(props: AchievementControlPanelTaskAdderProps) {
  const { achievementItems, setAchievementItems, resetCurrentTasks, pendingTasks } = props;

  const [addedTaskID, setAddedTaskID] = useState<number>(
    pendingTasks.length === 0 ? -1 : pendingTasks[0].id
  );

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const setTaskState = (taskID: number) => {
    achievementItems[taskID].isTask = true;
    setAchievementItems(achievementItems);
  };

  const addingAction = (e: any) => {
    setDialogOpen(!isDialogOpen);
    setTaskState(addedTaskID);
    resetCurrentTasks();
    setAddedTaskID(pendingTasks.length === 0 ? -1 : pendingTasks[0].id);
  };

  return (
    <>
      <Button
        className="main-adder"
        onClick={() => setDialogOpen(!isDialogOpen)}
        text={'Add A Task'}
      />
      <AchievementTaskSelect
        tasks={pendingTasks}
        focusTaskID={addedTaskID}
        setFocusTaskID={setAddedTaskID}
        buttonText={'Add Task'}
        dialogHeader={'Add A Task'}
        emptyTasksMessage={'You have no more tasks to add'}
        setDialogOpen={() => setDialogOpen(!isDialogOpen)}
        isDialogOpen={isDialogOpen}
        action={addingAction}
      />
    </>
  );
}

export default AchievementControlPanelTaskAdder;
