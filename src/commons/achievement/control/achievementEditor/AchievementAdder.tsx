import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { achievementTemplate } from './AchievementTemplate';

type Props = {
  allowNewUuid: boolean;
  setNewUuid: (uuid: string) => void;
};

const AchievementAdder: React.FC<Props> = ({ allowNewUuid, setNewUuid }) => {
  const inferencer = useContext(AchievementContext);

  const addAchievement = () => setNewUuid(inferencer.insertAchievement(achievementTemplate));

  return (
    <Button
      className="command-button"
      disabled={!allowNewUuid}
      icon={IconNames.NEW_OBJECT}
      onClick={addAchievement}
      text="Create Achievement"
    />
  );
};

export default AchievementAdder;
