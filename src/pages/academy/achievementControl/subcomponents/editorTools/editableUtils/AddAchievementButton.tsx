import React from 'react';
import { Button } from '@blueprintjs/core';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';
import { achievementTemplate } from '../AchievementTemplate';

type AddAchievementButtonProps = {
  inferencer: Inferencer;
  forceRefresh: any;
  addAchievement: any;
};

function AddAchievementButton(props: AddAchievementButtonProps) {
  const { inferencer, forceRefresh } = props;

  const handleAddAchievement = () => {
    inferencer.addAchievement(achievementTemplate);
    // TODO: Add this before production
    // addAchievement(achievementTemplate);
    forceRefresh();
  };

  return <Button className="main-adder" onClick={handleAddAchievement} text={'Add A New Item'} />;
}

export default AddAchievementButton;
