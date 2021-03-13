import { Button, MenuItem, NumericInput } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { AchievementGoal, GoalProgress } from 'src/features/achievement/AchievementTypes';

type AchievementManualEditorProps = {
  studio: string;
  updateGoalProgress: (studentId: number, progress: GoalProgress) => void;
};

const GoalSelect = Select.ofType<AchievementGoal>();
const goalRenderer: ItemRenderer<AchievementGoal> = (goal, { handleClick }) => (
  <MenuItem key={goal.uuid} onClick={handleClick} text={goal.text} />
);

function AchievementManualEditor(props: AchievementManualEditorProps) {
  const { studio, updateGoalProgress } = props;

  const inferencer = useContext(AchievementContext);
  const manualAchievements: AchievementGoal[] = inferencer
    .getAllGoals()
    .filter(goals => goals.meta.type === 'Manual');

  const [goal, changeGoal] = useState(manualAchievements[0]);
  const [userId, changeUserId] = useState(0);
  const [xp, changeXp] = useState(goal ? goal.xp : 0);

  const updateGoal = () => {
    if (goal) {
      const progress: GoalProgress = {
        uuid: goal.uuid,
        xp: xp,
        maxXp: goal.maxXp,
        completed: xp >= goal.maxXp
      };
      updateGoalProgress(userId, progress);
    }
  };

  if (studio !== 'Staff') {
    // TODO
    // For the studio's avenger to manually assign to his students
    // In theory, just copy paste the bottom code, but make userID a select
    return (
      <div className="achievement-manual-editor">
        <h3>{studio}</h3>
      </div>
    );
  } else {
    return (
      <div className="achievement-manual-editor">
        <h3>User ID: </h3>
        <NumericInput
          value={userId}
          min={0}
          allowNumericCharactersOnly={true}
          placeholder="User ID"
          onValueChange={changeUserId}
        />

        <h3>Goal: </h3>
        <GoalSelect
          filterable={false}
          items={manualAchievements}
          itemRenderer={goalRenderer}
          onItemSelect={changeGoal}
        >
          <Button outlined={true} text={goal ? goal.text : 'No Goal Selected'} color="White" />
        </GoalSelect>

        <h3>XP: </h3>
        <NumericInput
          value={xp}
          min={0}
          max={goal ? goal.maxXp : 0}
          allowNumericCharactersOnly={true}
          placeholder="XP"
          onValueChange={changeXp}
        />

        <h3> </h3>
        <Button outlined={true} text="Update Goal" onClick={updateGoal} intent="primary" />
      </div>
    );
  }
}

export default AchievementManualEditor;
