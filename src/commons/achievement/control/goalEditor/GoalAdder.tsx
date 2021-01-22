import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { goalDefinitionTemplate } from './GoalTemplate';

type GoalAdderProps = {
  allowNewId: boolean;
  setNewId: (id: number) => void;
};

function GoalAdder(props: GoalAdderProps) {
  const { allowNewId, setNewId } = props;

  const inferencer = useContext(AchievementContext);

  const addGoal = () => setNewId(inferencer.insertGoalDefinition(goalDefinitionTemplate));

  return (
    <Button
      className="command-button"
      disabled={!allowNewId}
      icon={IconNames.NEW_OBJECT}
      onClick={addGoal}
      text="Create Goal"
    />
  );
}

export default GoalAdder;
