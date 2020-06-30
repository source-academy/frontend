import React, { useState } from 'react';
import { Button, Dialog } from '@blueprintjs/core';

type AchievementDeleterProps = {
  deleteAchievement: any;
};

function AchievementDeleter(props: AchievementDeleterProps) {
  const { deleteAchievement } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        icon={'trash'}
        text={'Delete Achievement'}
        intent={'danger'}
        onClick={() => setDialogOpen(!isDialogOpen)}
      />
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        className={'task-selector'}
        title={'Confirm Delete'}
      >
        <p> Are you sure you want to delete this achievement?</p>

        <Button
          text={'Delete Achievement'}
          className={'editor-button'}
          intent={'danger'}
          onClick={deleteAchievement}
        />
      </Dialog>
    </>
  );
}

export default AchievementDeleter;
