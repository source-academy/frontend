import { Button } from '@blueprintjs/core';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { achievementTemplate } from '../AchievementTemplate';

type AchievementAdderProps = {
  admitId: (id: number) => void;
  isHoldingId: boolean;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { admitId, isHoldingId } = props;

  const inferencer = useContext(AchievementContext);

  const handleAddAchievement = () => admitId(inferencer.insertAchievement(achievementTemplate));

  return (
    <Button
      className="main-adder"
      onClick={handleAddAchievement}
      text={'Add A New Item'}
      disabled={isHoldingId}
    />
  );
}

export default AchievementAdder;
