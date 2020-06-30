import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';
import AchievementTaskSelector from './AchievementTaskSelector';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

type AchievementTaskPositionEditorProps = {
  editableAchievement: AchievementItem;
  inferencer: Inferencer;
};

function AchievementTaskPositionEditor(props: AchievementTaskPositionEditorProps) {
  const { editableAchievement, inferencer } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const taskIDs = inferencer.listTaskIds();

  const [swappedTaskID, setSwappedTaskID] = useState<number>(taskIDs.length === 0 ? 0 : taskIDs[0]);

  const swappingAction = (e: any) => {
    toggleDialogOpen();
    inferencer.swapAchievementPositions(
      editableAchievement,
      inferencer.getAchievementItem(swappedTaskID)
    );
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Change Pos'} />
      <AchievementTaskSelector
        tasks={taskIDs}
        inferencer={inferencer}
        focusTaskID={swappedTaskID}
        setFocusTaskID={setSwappedTaskID}
        buttonText={'Swap Positions'}
        dialogHeader={"Swap this task's position"}
        emptyTasksMessage={'You have no more tasks to swap with'}
        setDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={swappingAction}
      />
    </>
  );
}

export default AchievementTaskPositionEditor;
