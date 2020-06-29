import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import AchievementTaskSelector from './AchievementTaskSelector';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';

export type AchievementTaskAdderProps = {
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function AchievementTaskAdder(props: AchievementTaskAdderProps) {
  const { inferencer, updateAchievements } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const nonTaskIDs = inferencer.listNonTaskIds();

  const [addedTaskID, setAddedTaskID] = useState<number>(
    nonTaskIDs.length === 0 ? 0 : nonTaskIDs[0]
  );

  /*
  useEffect(() => {
    setAddedTaskID(inferencer.getNextID(nonTaskIDs));
  }, [inferencer, nonTaskIDs]);
  */

  const addNewTask = () => {
    const achievement = inferencer.getAchievementItem(addedTaskID);
    achievement.isTask = true;
    inferencer.editAchievement(achievement);
    // TODO: add this
    // editAchievement(achievement);
    updateAchievements(inferencer.getAchievements());
  };

  const addingAction = (e: any) => {
    toggleDialogOpen();
    addNewTask();
  };

  return (
    <>
      <Button className="main-adder" onClick={toggleDialogOpen} text={'Add A Task'} />
      <AchievementTaskSelector
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

export default AchievementTaskAdder;
