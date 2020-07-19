import { Button, EditableText, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { AchievementGoal } from 'src/features/achievement/AchievementTypes';

type EditableAchievementGoalProps = {
  goal: AchievementGoal;
  editGoal: any;
  removeGoal: any;
};

function EditableAchievementGoal(props: EditableAchievementGoalProps) {
  const { goal, editGoal, removeGoal } = props;
  const [newGoal, setNewGoal] = useState<AchievementGoal>(goal);

  const { goalText, goalProgress, goalTarget } = newGoal;

  const changeGoalText = (goalText: string) => {
    newGoal.goalText = goalText;
    setNewGoal(newGoal);
    editGoal(newGoal);
  };

  const changeTarget = (goalTarget: string) => {
    const newGoalTarget = isNaN(parseInt(goalTarget)) ? 0 : parseInt(goalTarget);
    newGoal.goalTarget = newGoalTarget;
    setNewGoal(newGoal);
    editGoal(newGoal);
  };

  return (
    <div className="goal">
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
