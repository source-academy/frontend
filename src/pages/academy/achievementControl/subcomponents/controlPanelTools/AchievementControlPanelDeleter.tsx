import React from 'react';
import { Dialog, Button } from '@blueprintjs/core';

type AchievementControlPanelDeleterProps = {
  toggleDialogFlag: any;
  deletePrerequisite: any;
  flag: string; 
  isDialogOpen: boolean;
};

function AchievementControlPanelDeleter(props : AchievementControlPanelDeleterProps) {
  const { toggleDialogFlag, deletePrerequisite, flag, isDialogOpen } = props;

    return (
        <>
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag(flag)}
        text={'Delete A Prerequisite'}
      />
      <Dialog
        onClose={() => toggleDialogFlag(flag)}
        isOpen={isDialogOpen}
        title="Delete Prerequisite"
      >
        <Button className="editor-button" onClick={deletePrerequisite} text={'Delete'} />
      </Dialog>
        </>
    );
} 

export default AchievementControlPanelDeleter;