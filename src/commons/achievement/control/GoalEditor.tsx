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
   * newUuid helps us to ensure that only ONE goal is added at any point of time.
   *
   * By default,  the newUuid is an empty string, which means currently no new goal
   * is being added and the admin is able to add a new goal.
   *
   * Conversely, if the newUuid is not an empty string, this means currently a goal
   * is being added to the system and the admin is not allowed to add two goals
   * at one go. The newUuid holds the newly created goal uuid until the new goal
   * is added into the inferencer.
   * 
   * NOTE: was previously NaN by default, not sure how this should change for uuid
   */
  const [newUuid, setNewUuid] = useState<string>('');
  const allowNewUuid = newUuid === '';
  const releaseUuid = (uuid: string) => (uuid === newUuid ? setNewUuid('') : undefined);

  /**
   * Generates <EditableGoal /> components
   *
   * @param goalUuids an array of goalUuid
   */
  const generateEditableGoals = (goalUuids: string[]) =>
    goalUuids.map(uuid => (
      <EditableGoal
        key={uuid}
        uuid={uuid}
        releaseUuid={releaseUuid}
        requestPublish={requestPublish}
      />
    ));

  // NOTE: editable cards used to be sorted by id in descending order
  // However, UUID removes the guarantee of order preserving IDs
  return (
    <div className="goal-editor">
      <div className="command">
        <GoalAdder allowNewUuid={allowNewUuid} setNewUuid={setNewUuid} />
      </div>
      <ul className="goal-container">
        {generateEditableGoals(inferencer.getAllGoalUuids())}
      </ul>
    </div>
  );
}

export default GoalEditor;
