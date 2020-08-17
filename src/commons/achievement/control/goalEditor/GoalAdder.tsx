import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { goalTemplate } from './GoalTemplate';

type GoalAdderProps = {
  allowNewId: boolean;
  setNewId: (id: number) => void;
};

function GoalAdder(props: GoalAdderProps) {
  const { allowNewId, setNewId } = props;

  const inferencer = useContext(AchievementContext);

  const handleAddGoal = () => setNewId(inferencer.insertGoalDefinition(goalTemplate));

  return (
    <Button
      className="command-button"
      disabled={!allowNewId}
      icon={IconNames.NEW_OBJECT}
      onClick={handleAddGoal}
      text="Create Goal"
    />
  );
}

export default GoalAdder;
