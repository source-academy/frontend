import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import { goalDefinitionTemplate } from './GoalTemplate';

type GoalAdderProps = {
  allowNewUuid: boolean;
  setNewUuid: (uuid: string) => void;
};

function GoalAdder(props: GoalAdderProps) {
  const { allowNewUuid, setNewUuid } = props;

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
}

export default GoalAdder;
