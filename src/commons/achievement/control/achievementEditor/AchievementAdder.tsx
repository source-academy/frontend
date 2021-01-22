import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { achievementTemplate } from './AchievementTemplate';

type AchievementAdderProps = {
  allowNewId: boolean;
  setNewId: (id: number) => void;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { allowNewId, setNewId } = props;

  const inferencer = useContext(AchievementContext);

  const addAchievement = () => setNewId(inferencer.insertAchievement(achievementTemplate));

  return (
    <Button
      className="command-button"
      disabled={!allowNewId}
      icon={IconNames.NEW_OBJECT}
      onClick={addAchievement}
      text="Create Achievement"
    />
  );
}

export default AchievementAdder;
