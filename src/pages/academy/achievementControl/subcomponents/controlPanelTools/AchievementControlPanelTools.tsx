import React, { useState } from 'react';

import { Button, Dialog } from '@blueprintjs/core';

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
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag('addition')}
        text={'Add New Prerequisite'}
      />
      <Dialog
        onClose={() => toggleDialogFlag('addition')}
        isOpen={dialogFlags['addition']}
        title="Add Prerequisite"
      >
        <Button className="editor-button" onClick={addPrerequisite} text={'Add'} />
      </Dialog>

      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag('deletion')}
        text={'Delete A Prerequisite'}
      />
      <Dialog
        onClose={() => toggleDialogFlag('deletion')}
        isOpen={dialogFlags['deletion']}
        title="Delete Prerequisite"
      >
        <Button className="editor-button" onClick={deletePrerequisite} text={'Delete'} />
      </Dialog>

      <Button className="editor-button" onClick={deleteTask} text={'Delete This Task'} />
    </>
  );
}

export default AchievementControlPanelTools;
