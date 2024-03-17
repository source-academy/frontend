import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { goalDefinitionTemplate } from './GoalTemplate';

type Props = {
  allowNewUuid: boolean;
  setNewUuid: (uuid: string) => void;
};

const GoalAdder: React.FC<Props> = ({ allowNewUuid, setNewUuid }) => {
  const inferencer = useContext(AchievementContext);

  const addGoal = () => setNewUuid(inferencer.insertGoalDefinition(goalDefinitionTemplate));

  return (
    <Button
      className="command-button"
      disabled={!allowNewUuid}
      icon={IconNames.NEW_OBJECT}
      onClick={addGoal}
      text="Create Goal"
    />
  );
};

export default GoalAdder;
