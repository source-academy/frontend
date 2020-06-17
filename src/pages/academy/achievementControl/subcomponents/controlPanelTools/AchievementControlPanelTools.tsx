import React, { useState } from 'react';

import { Button } from '@blueprintjs/core';

import AchievementControlPanelDeleter from './AchievementControlPanelDeleter';
import AchievementControlPanelAdder from './AchievementControlPanelAdder';

type AchievementControlPanelToolsProps = {
  addPrerequisite: any;
  deletePrerequisite: any;
  deleteTask: any;
};

type AchievementDialogFlags = {
  addition: boolean;
  deletion: boolean;
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const { addPrerequisite, deletePrerequisite, deleteTask } = props;
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
      />

      <AchievementControlPanelDeleter 
          toggleDialogFlag={toggleDialogFlag}
          deletePrerequisite={deletePrerequisite}
          flag={'deletion'}
          isDialogOpen={dialogFlags['deletion']}
      />

      <Button className="editor-button" onClick={deleteTask} text={'Delete This Task'} />
    </>
  );
}

export default AchievementControlPanelTools;
