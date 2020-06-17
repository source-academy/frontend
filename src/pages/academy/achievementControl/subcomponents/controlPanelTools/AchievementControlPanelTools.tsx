import React, { useState } from 'react';

import { Button } from '@blueprintjs/core';

import AchievementControlPanelDeleter from './AchievementControlPanelDeleter';
import AchievementControlPanelAdder from './AchievementControlPanelAdder';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

type AchievementControlPanelToolsProps = {
  addPrerequisite: any;
  deletePrerequisite: any;
  deleteTask: any;
  prerequisites: AchievementItem[];
  nonPrerequisites: AchievementItem[];
  taskID: number;
};

type AchievementDialogFlags = {
  addition: boolean;
  deletion: boolean;
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const {
    addPrerequisite,
    deletePrerequisite,
    deleteTask,
    prerequisites,
    nonPrerequisites,
    taskID
  } = props;
  const [dialogFlags, setDialogFlags] = useState<AchievementDialogFlags>({
    addition: false,
    deletion: false
  });

  const toggleDialogFlag = (flag: keyof AchievementDialogFlags) => {
    setDialogFlags({
      ...dialogFlags,
      [flag]: !dialogFlags[flag]
    });
  };

  return (
    <>
      <AchievementControlPanelAdder
        toggleDialogFlag={toggleDialogFlag}
        addPrerequisite={addPrerequisite}
        flag={'addition'}
        isDialogOpen={dialogFlags['addition']}
        nonPrerequisites={nonPrerequisites}
        taskID={taskID}
      />

      <AchievementControlPanelDeleter
        toggleDialogFlag={toggleDialogFlag}
        deletePrerequisite={deletePrerequisite}
        flag={'deletion'}
        isDialogOpen={dialogFlags['deletion']}
        prerequisites={prerequisites}
        taskID={taskID}
      />

      <Button className="editor-button" onClick={deleteTask} text={'Delete This Task'} />
    </>
  );
}

export default AchievementControlPanelTools;
