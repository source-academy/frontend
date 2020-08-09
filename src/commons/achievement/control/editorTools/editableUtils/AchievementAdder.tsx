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
    // Mark this new achievementId as controlId, it will only get released
    // when this achievement is saved into the inferencer
    setControlId(createdId);
  };

  const disableAdder = !isNaN(controlId);

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
