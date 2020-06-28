import React from 'react';
import { Button } from '@blueprintjs/core';

type AchievementDeleterProps = {
  deleteAchievement: any;
};

function AchievementDeleter(props: AchievementDeleterProps) {
  const { deleteAchievement } = props;

  return (
    <Button
      icon={'trash'}
      text={'Delete Achievement'}
      intent={'danger'}
      onClick={deleteAchievement}
    />
  );
}

export default AchievementDeleter;
