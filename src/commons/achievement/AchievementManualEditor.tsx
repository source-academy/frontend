import { Button, Checkbox, MenuItem, NumericInput } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import React, { useContext, useEffect, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import {
  AchievementGoal,
  AchievementUser,
  GoalProgress
} from 'src/features/achievement/AchievementTypes';

import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';

const GoalSelect = Select.ofType<AchievementGoal>();
const goalRenderer: ItemRenderer<AchievementGoal> = (goal, { handleClick }) => (
  <MenuItem key={goal.uuid} onClick={handleClick} text={goal.text} />
);
const goalPredicate: ItemPredicate<AchievementGoal> = (query, item) =>
  item.text.toLowerCase().includes(query.toLowerCase());

const UserSelect = Select.ofType<AchievementUser>();
const userRenderer: ItemRenderer<AchievementUser> = (user, { handleClick }) => (
  <MenuItem key={user.courseRegId} onClick={handleClick} text={user.name || user.username} />
);
const userPredicate: ItemPredicate<AchievementUser> = (query, item) =>
  [item.name, item.username, item.group].reduce(
    (acc: boolean, x) => (x ? acc || x.toLowerCase().includes(query.toLowerCase()) : acc),
    false
  );

export function updateGoalProcessed() {
  showSuccessMessage('Goal updated');
}

type Props = {
  hiddenState: [boolean, any];
  userState: [AchievementUser | undefined, any];
  studio: string;
  users: AchievementUser[];
  getUsers: () => void;
  updateGoalProgress: (studentCourseRegId: number, progress: GoalProgress) => void;
};

const AchievementManualEditor: React.FC<Props> = props => {
  const { userState, hiddenState, studio, getUsers, updateGoalProgress } = props;
  const users =
    studio === 'Staff'
      ? // The name can be null for users who have yet to log in. We push these to the back of the array.
        [...props.users].sort(
          (user1, user2) =>
            user1.name != null && user2.name != null
              ? user1.name.localeCompare(user2.name)
              : user1.name == null
                ? 1 // user1.name is null, user1 > user2
                : -1 // user2.name is null, user1 < user2
        )
      : props.users
          .filter(user => user.group === studio)
          .sort(
            (user1, user2) =>
              user1.name != null && user2.name != null
                ? user1.name.localeCompare(user2.name)
                : user1.name == null
                  ? 1 // user1.name is null, user1 > user2
                  : -1 // user2.name is null, user1 < user2
          );

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const inferencer = useContext(AchievementContext);
  const manualAchievements: AchievementGoal[] = inferencer
    .getAllGoals()
    .filter(goals => goals.meta.type === 'Manual');

  const [goal, changeGoal] = useState<AchievementGoal | undefined>(undefined);
  const [selectedUser, changeSelectedUser] = userState;
  const [count, changeCount] = useState(0);
  const [viewHidden, changeViewHidden] = hiddenState;

  const updateGoal = () => {
    if (goal && selectedUser) {
      const progress: GoalProgress = {
        uuid: goal.uuid,
        count: count < 0 ? 0 : Math.floor(count),
        targetCount: goal.targetCount,
        completed: count >= goal.targetCount
      };
      updateGoalProgress(selectedUser.courseRegId, progress);
    } else {
      if (!goal) {
        showWarningMessage('Goal not selected');
      }
      if (!selectedUser) {
        showWarningMessage('User not selected');
      }
    }
  };

  return (
    <div className="achievement-manual-editor">
      <div className="editor-section">
        <h3>User: </h3>
        <UserSelect
          filterable={true}
          items={users}
          itemRenderer={userRenderer}
          itemPredicate={userPredicate}
          onItemSelect={changeSelectedUser}
          noResults={<MenuItem disabled={true} text="No matching user" />}
        >
          <Button
            outlined={true}
            text={selectedUser ? selectedUser.name || selectedUser.username : 'No User Selected'}
            color="White"
          />
        </UserSelect>
      </div>

      <div className="editor-section">
        <h3>Goal: </h3>
        <GoalSelect
          filterable={true}
          items={manualAchievements}
          itemRenderer={goalRenderer}
          itemPredicate={goalPredicate}
          onItemSelect={changeGoal}
          noResults={<MenuItem disabled={true} text="No matching goal" />}
        >
          <Button outlined={true} text={goal ? goal.text : 'No Goal Selected'} color="White" />
        </GoalSelect>
      </div>

      <div className="editor-section">
        <h3>Count: </h3>
        <NumericInput
          value={count}
          min={0}
          allowNumericCharactersOnly={true}
          minorStepSize={null}
          placeholder="Count"
          onValueChange={changeCount}
        />
      </div>

      <div className="editor-section">
        <Button outlined={true} text="Update Goal" onClick={updateGoal} intent="primary" />
      </div>

      <div className="editor-section">
        <Checkbox
          checked={viewHidden}
          label="View Hidden Achievements"
          onChange={() => changeViewHidden(!viewHidden)}
        />
      </div>
    </div>
  );
};

export default AchievementManualEditor;
