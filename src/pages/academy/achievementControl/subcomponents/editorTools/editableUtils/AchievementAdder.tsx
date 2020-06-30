import React from 'react';
import { Button } from '@blueprintjs/core';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';
import { achievementTemplate } from '../AchievementTemplate';

type AchievementAdderProps = {
  inferencer: Inferencer;
  adderId: number;
  setAdderId: any;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { inferencer, adderId, setAdderId } = props;

  const handleAddAchievement = () => {
    const newId = inferencer.addAchievement(achievementTemplate);
    setAdderId(newId);
  };

  const disableAdder = adderId !== -1;

  return (
    <Button
      className="main-adder"
      onClick={handleAddAchievement}
      text={'Add A New Item'}
      disabled={disableAdder}
    />
  );
}

export default AchievementAdder;
