import React, { useState } from 'react';

import { Button, Dialog } from '@blueprintjs/core';

type AchievementControlPanelToolsProps = {
  addPrerequisite: any;
  deletePrerequisite: any;
  deleteTask: any;
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const { addPrerequisite, deletePrerequisite, deleteTask } = props;

  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        className="editor-button"
        onClick={() => setOpen(true)}
        text={'Add New Prerequisite'}
      />
      <Dialog onClose={() => setOpen(!isOpen)} isOpen={isOpen} title="Add Prerequisite">
        <Button className="editor-button" onClick={addPrerequisite} text={'Add'} />
      </Dialog>

      <Button
        className="editor-button"
        onClick={() => setOpen(true)}
        text={'Delete A Prerequisite'}
      />
      <Dialog onClose={() => setOpen(!isOpen)} isOpen={isOpen} title="Delete Prerequisite">
        <Button className="editor-button" onClick={deletePrerequisite} text={'Delete'} />
      </Dialog>

      <Button className="editor-button" onClick={deleteTask} text={'Delete This Task'} />
    </>
  );
}

export default AchievementControlPanelTools;
