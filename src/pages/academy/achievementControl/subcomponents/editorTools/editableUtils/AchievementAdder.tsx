import React from 'react';
import { Button } from '@blueprintjs/core';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';
import { achievementTemplate } from '../AchievementTemplate';

type AchievementAdderProps = {
  inferencer: Inferencer;
  forceRefresh: any;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { inferencer, forceRefresh } = props;

  const handleAddAchievement = () => {
    inferencer.addAchievement(achievementTemplate);
    forceRefresh();
  };

  return <Button className="main-adder" onClick={handleAddAchievement} text={'Add A New Item'} />;
}

export default AchievementAdder;
