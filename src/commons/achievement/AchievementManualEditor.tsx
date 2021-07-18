import { Button, MenuItem, NumericInput } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { useContext, useEffect, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import {
  AchievementGoal,
  AchievementUser,
  GoalProgress
} from 'src/features/achievement/AchievementTypes';

type AchievementManualEditorProps = {
  studio: string;
  users: AchievementUser[];
  getUsers: () => void;
  updateGoalProgress: (studentCourseRegId: number, progress: GoalProgress) => void;
};

const GoalSelect = Select.ofType<AchievementGoal>();
const goalRenderer: ItemRenderer<AchievementGoal> = (goal, { handleClick }) => (
  <MenuItem key={goal.uuid} onClick={handleClick} text={goal.text} />
);

function AchievementManualEditor(props: AchievementManualEditorProps) {
  const { studio, getUsers, updateGoalProgress } = props;
  const users =
    studio === 'Staff'
      ? // The name can be null for users who have yet to log in. We push these to the back of the array.
        [...props.users].sort((user1, user2) =>
          user1.name ? user1.name.localeCompare(user2.name) : 1
        )
      : props.users
          .filter(user => user.group === studio)
          .sort((user1, user2) => (user1.name ? user1.name.localeCompare(user2.name) : 1));

  useEffect(getUsers, [getUsers]);

  const inferencer = useContext(AchievementContext);
  const manualAchievements: AchievementGoal[] = inferencer
    .getAllGoals()
    .filter(goals => goals.meta.type === 'Manual');

  const [goal, changeGoal] = useState(manualAchievements[0]);
  const [selectedUser, changeSelectedUser] = useState(users[0]);
  const [count, changeCount] = useState(0);

  const UserSelect = Select.ofType<AchievementUser>();
  const userRenderer: ItemRenderer<AchievementUser> = (user, { handleClick }) => (
    <MenuItem key={user.courseRegId} onClick={handleClick} text={user.name} />
  );

  const updateGoal = () => {
    if (goal) {
      const progress: GoalProgress = {
        uuid: goal.uuid,
        count: count,
        targetCount: goal.targetCount,
        completed: count >= goal.targetCount
      };
      updateGoalProgress(selectedUser.courseRegId, progress);
    }
  };

  return (
    <div className="achievement-manual-editor">
      <h3>User: </h3>
      <UserSelect
        filterable={false}
        items={users}
        itemRenderer={userRenderer}
        onItemSelect={changeSelectedUser}
      >
        <Button
          outlined={true}
          text={selectedUser ? selectedUser.name : 'No User Selected'}
          color="White"
        />
      </UserSelect>

      <h3>Goal: </h3>
      <GoalSelect
        filterable={false}
        items={manualAchievements}
        itemRenderer={goalRenderer}
        onItemSelect={changeGoal}
      >
        <Button outlined={true} text={goal ? goal.text : 'No Goal Selected'} color="White" />
      </GoalSelect>

      <h3>Count: </h3>
      <NumericInput
        value={count}
        min={0}
        allowNumericCharactersOnly={true}
        placeholder="Count"
        onValueChange={changeCount}
      />

      <h3> </h3>
      <Button outlined={true} text="Update Goal" onClick={updateGoal} intent="primary" />
    </div>
  );
}

export default AchievementManualEditor;
