import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { achievementTemplate } from './AchievementTemplate';

type AchievementAdderProps = {
  allowNewUuid: boolean;
  setNewUuid: (uuid: string) => void;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { allowNewUuid, setNewUuid } = props;

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
}

export default AchievementAdder;
