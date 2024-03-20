import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import EditableGoal from './goalEditor/EditableGoal';
import GoalAdder from './goalEditor/GoalAdder';

let editableGoals: JSX.Element[] = [];

type Props = {
  requestPublish: () => void;
};

const GoalEditor: React.FC<Props> = ({ requestPublish }) => {
  const inferencer = useContext(AchievementContext);

  /**
   * newUuid helps us to ensure that only ONE goal is added at any point of time.
   *
   * By default,  the newUuid is an empty string, which means currently no new goal
   * is being added and the admin is able to add a new goal.
   *
   * Conversely, if the newUuid is not an empty string, this means currently a goal
   * is being added to the system and the admin is not allowed to add two goals
   * at one go. The newUuid holds the newly created goal uuid until the new goal
   * is added into the inferencer.
   */
  const [newUuid, setNewUuid] = useState('');
  const allowNewUuid = newUuid === '';
  const releaseUuid = () => setNewUuid('');

  const removeCard = (uuid: string) => {
    let idx = 0;
    while (editableGoals[idx].key !== uuid && idx < editableGoals.length) {
      idx++;
    }
    editableGoals.splice(idx, 1);
  };

  const generateEditableGoal = (goalUuid: string, isNewGoal: boolean) => (
    <EditableGoal
      key={goalUuid}
      uuid={goalUuid}
      isNewGoal={isNewGoal}
      releaseUuid={releaseUuid}
      requestPublish={requestPublish}
      removeCard={removeCard}
    />
  );

  // load preexisting goals from the inferencer
  if (editableGoals.length === 0) {
    editableGoals = inferencer.getAllGoalUuids().map(uuid => generateEditableGoal(uuid, false));
  }

  const addNewGoal = (uuid: string) => {
    setNewUuid(uuid);
    // keep the new goal on top by swapping it with the first element
    editableGoals[editableGoals.length] = editableGoals[0];
    editableGoals[0] = generateEditableGoal(uuid, true);
  };

  return (
    <div className="goal-editor">
      <div className="command">
        <GoalAdder allowNewUuid={allowNewUuid} setNewUuid={addNewGoal} />
      </div>
      <ul className="goal-container">{editableGoals}</ul>
    </div>
  );
};

export default GoalEditor;
