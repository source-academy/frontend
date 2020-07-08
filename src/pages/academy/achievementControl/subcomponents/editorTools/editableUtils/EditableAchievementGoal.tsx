import React, { useState } from 'react';
import { AchievementGoal } from 'src/commons/achievements/AchievementTypes';
import { Icon, EditableText, Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type EditableAchievementGoalProps = {
  goal: AchievementGoal;
  editGoal: any;
  removeGoal: any;
};

function EditableAchievementGoal(props: EditableAchievementGoalProps) {
  const { goal, editGoal, removeGoal } = props;
  const [newGoal, setNewGoal] = useState<AchievementGoal>(goal);

  const { goalId, goalText, goalProgress, goalTarget } = newGoal;

  const changeGoalText = (goalText: string) => {
    newGoal.goalText = goalText;
    setNewGoal(newGoal);
    editGoal(newGoal);
  };

  const changeTarget = (goalTarget: string) => {
    newGoal.goalTarget = parseInt(goalTarget);
    setNewGoal(newGoal);
    editGoal(newGoal);
  };

  return (
    <div className="goal" key={goalId}>
      <div className="goal-medal">
        <Icon color="#F0E68C" className="goal-award" iconSize={44} icon={IconNames.BADGE} />
        <div>
          {goalProgress} /{' '}
          <EditableText
            placeholder={`Enter your goal target here`}
            value={goalTarget.toString()}
            onChange={changeTarget}
          />{' '}
          XP
        </div>
      </div>
      <div className="goal-text">
        <EditableText
          placeholder={`Enter your goal text here`}
          value={goalText}
          onChange={changeGoalText}
        />
      </div>
      <Button text={'Remove Goal'} onClick={() => removeGoal(newGoal)} />
    </div>
  );
}

export default EditableAchievementGoal;
