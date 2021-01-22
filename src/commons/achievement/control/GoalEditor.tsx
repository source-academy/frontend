import { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import EditableGoal from './goalEditor/EditableGoal';
import GoalAdder from './goalEditor/GoalAdder';

type GoalEditorProps = {
  requestPublish: () => void;
};

function GoalEditor(props: GoalEditorProps) {
  const { requestPublish } = props;

  const inferencer = useContext(AchievementContext);

  /**
   * newId helps us to ensure that only ONE goal is added at any point of time.
   *
   * By default,  the newId is NaN, which means currently no new goal
   * is being added and the admin is able to add a new goal.
   *
   * Conversely, if the newId is not NaN, this means currently a goal
   * is being added to the system and the admin is not allowed to add two goals
   * at one go. The newId holds the newly created goal id until the new goal
   * is added into the inferencer.
   */
  const [newId, setNewId] = useState<number>(NaN);
  const allowNewId = isNaN(newId);
  const releaseId = (id: number) => (id === newId ? setNewId(NaN) : undefined);

  /**
   * Generates <EditableGoal /> components
   *
   * @param goalIds an array of goalId
   */
  const generateEditableGoals = (goalIds: number[]) =>
    goalIds.map(id => (
      <EditableGoal key={id} id={id} releaseId={releaseId} requestPublish={requestPublish} />
    ));

  return (
    <div className="goal-editor">
      <div className="command">
        <GoalAdder allowNewId={allowNewId} setNewId={setNewId} />
      </div>
      <ul className="goal-container">
        {generateEditableGoals(inferencer.getAllGoalIds().sort((a, b) => b - a))}
      </ul>
    </div>
  );
}

export default GoalEditor;
