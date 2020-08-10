import { Button } from '@blueprintjs/core';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { achievementTemplate } from '../AchievementTemplate';

type AchievementAdderProps = {
  allowNewId: boolean;
  setNewId: (id: number) => void;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { allowNewId, setNewId } = props;

  const inferencer = useContext(AchievementContext);

  const handleAddAchievement = () => setNewId(inferencer.insertAchievement(achievementTemplate));

  return (
    <Button
      className="main-adder"
      onClick={handleAddAchievement}
      text={'Add A New Item'}
      disabled={!allowNewId}
    />
  );
}

export default AchievementAdder;
