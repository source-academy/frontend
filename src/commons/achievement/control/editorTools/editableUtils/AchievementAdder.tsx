import { Button } from '@blueprintjs/core';
import React from 'react';

import AchievementInferencer from '../../../utils/AchievementInferencer';
import { achievementTemplate } from '../AchievementTemplate';

type AchievementAdderProps = {
  inferencer: AchievementInferencer;
  controlState: [number, any];
};

function AchievementAdder(props: AchievementAdderProps) {
  const { inferencer, controlState } = props;

  const [controlId, setControlId] = controlState;

  const handleAddAchievement = () => {
    const createdId = inferencer.insertAchievement(achievementTemplate);
    setControlId(createdId);
  };

  const disableAdder = controlId !== -1;

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
