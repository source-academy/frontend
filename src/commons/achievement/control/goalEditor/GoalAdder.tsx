import { Button } from '@blueprintjs/core';
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
      className="main-adder"
      onClick={handleAddGoal}
      text="Add A New Goal"
      disabled={!allowNewId}
    />
  );
}

export default GoalAdder;
