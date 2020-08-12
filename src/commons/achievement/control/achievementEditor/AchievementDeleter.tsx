import { Button, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';

type AchievementDeleterProps = {
  deleteAchievement: any;
};

function AchievementDeleter(props: AchievementDeleterProps) {
  const { deleteAchievement } = props;

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  return (
    <div className="deleter">
      <Button
        text={'Delete Achievement'}
        icon={IconNames.TRASH}
        intent={'danger'}
        onClick={toggleOpen}
      />
      <Dialog title={'Confirm Delete'} isOpen={isOpen} onClose={toggleOpen}>
        <p> Are you sure you want to delete this achievement?</p>

        <Button
          text={'Delete Achievement'}
          className={'editor-button'}
          intent={'danger'}
          onClick={deleteAchievement}
        />
      </Dialog>
    </div>
  );
}

export default AchievementDeleter;
