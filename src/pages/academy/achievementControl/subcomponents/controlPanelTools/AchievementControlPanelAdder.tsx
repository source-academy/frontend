import React from 'react';
import { Dialog, Button } from '@blueprintjs/core';

type AchievementControlPanelAdderProps = {
  toggleDialogFlag: any;
  addPrerequisite: any;
  flag: string; 
  isDialogOpen: boolean;
};

function AchievementControlPanelAdder(props : AchievementControlPanelAdderProps) {
  const { toggleDialogFlag, addPrerequisite, flag, isDialogOpen } = props;

    return (
        <>
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag(flag)}
        text={'Add A Prerequisite'}
      />
      <Dialog
        onClose={() => toggleDialogFlag(flag)}
        isOpen={isDialogOpen}
        title="Add Prerequisite"
      >
        <Button className="editor-button" onClick={addPrerequisite} text={'Add'} />
      </Dialog>
        </>
    );
} 

export default AchievementControlPanelAdder;