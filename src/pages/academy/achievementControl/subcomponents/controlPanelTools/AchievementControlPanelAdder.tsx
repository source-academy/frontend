import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementTaskSelect from './AchievementTaskSelect';

type AchievementControlPanelAdderProps = {
  toggleDialogFlag: any;
  addPrerequisite: any;
  flag: string;
  findNextID: any;
  isDialogOpen: boolean;
  nonPrerequisites: AchievementItem[];
  taskID: number;
};

function AchievementControlPanelAdder(props: AchievementControlPanelAdderProps) {
  const {
    toggleDialogFlag,
    addPrerequisite,
    flag,
    findNextID,
    nonPrerequisites,
    isDialogOpen,
    taskID
  } = props;

  const [addedPrerequisiteID, setAddedPrerequisiteID] = useState<number>(
    nonPrerequisites.length === 0 ? -1 : nonPrerequisites[0].id
  );

  const addingAction = (e: any) => {
    toggleDialogFlag(flag);
    addPrerequisite(taskID, addedPrerequisiteID);
    setAddedPrerequisiteID(findNextID(nonPrerequisites, addedPrerequisiteID));
  };

  return (
    <>
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag(flag)}
        text={'Add A Prerequisite'}
      />
      <AchievementTaskSelect
        tasks={nonPrerequisites}
        focusTaskID={addedPrerequisiteID}
        setFocusTaskID={setAddedPrerequisiteID}
        buttonText={'Add Prerequisite'}
        dialogHeader={'Add A Prerequisite'}
        emptyTasksMessage={'You have no more prerequisites to add'}
        setDialogOpen={() => toggleDialogFlag(flag)}
        isDialogOpen={isDialogOpen}
        action={addingAction}
      />
    </>
  );
}

export default AchievementControlPanelAdder;
