import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { achievementTemplate } from './AchievementTemplate';

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
      className="command-button"
      icon={IconNames.NEW_OBJECT}
      onClick={handleAddAchievement}
      text="Create Achievement"
      disabled={!allowNewId}
    />
  );
}

export default AchievementAdder;
