import React from 'react';
import { Button } from '@blueprintjs/core';

type DeleteAchievementButtonProps = {
  deleteAchievement: any;
};

function DeleteAchievementButton(props: DeleteAchievementButtonProps) {
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

export default DeleteAchievementButton;
