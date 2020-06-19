import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementTaskSelect from './AchievementTaskSelect';

type AchievementControlPanelDeleterProps = {
  toggleDialogFlag: any;
  deletePrerequisite: any;
  flag: string;
  findNextID: any;
  isDialogOpen: boolean;
  prerequisites: AchievementItem[];
  taskID: number;
};

function AchievementControlPanelDeleter(props: AchievementControlPanelDeleterProps) {
  const {
    toggleDialogFlag,
    deletePrerequisite,
    flag,
    findNextID,
    isDialogOpen,
    prerequisites,
    taskID
  } = props;

  const [deletedPrerequisiteID, setDeletedPrerequisiteID] = useState<number>(
    prerequisites.length === 0 ? -1 : prerequisites[0].id
  );

  const deleteAction = (e: any) => {
    toggleDialogFlag(flag);
    deletePrerequisite(taskID, deletedPrerequisiteID);
    setDeletedPrerequisiteID(findNextID(prerequisites, deletedPrerequisiteID));
  };

  return (
    <>
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag(flag)}
        text={'Delete A Prerequisite'}
      />
      <AchievementTaskSelect
        tasks={prerequisites}
        focusTaskID={deletedPrerequisiteID}
        setFocusTaskID={setDeletedPrerequisiteID}
        buttonText={'Delete Prerequisite'}
        dialogHeader={'Delete A Prerequisite'}
        emptyTasksMessage={'You have no more prerequisites to delete'}
        setDialogOpen={() => toggleDialogFlag(flag)}
        isDialogOpen={isDialogOpen}
        action={deleteAction}
      />
    </>
  );
}

export default AchievementControlPanelDeleter;
