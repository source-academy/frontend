import React, { useState } from 'react';
import { AchievementGoal } from 'src/commons/achievements/AchievementTypes';
import { Button, Dialog, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type EditableAchievementGoalsProps = {
  goals: AchievementGoal[];
  editGoals: any;
};

function EditableAchievementGoals(props: EditableAchievementGoalsProps) {
  const { goals, editGoals } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [newGoals, setNewGoals] = useState<AchievementGoal[]>(goals);

  const createNewGoal = () => {
    const newID = newGoals.length;
    const newGoal: AchievementGoal = {
      goalId: newID,
      goalText: 'Sample Text',
      goalProgress: 0,
      goalTarget: 0
    };

    newGoals.push(newGoal);
    setNewGoals(newGoals);
    editGoals(newGoals);
  };

  const mapGoalToJSX = (goal: AchievementGoal) => {
    const { goalId, goalText, goalProgress, goalTarget } = goal;
    return (
      <div className="goal" key={goalId}>
        <div className="goal-medal">
          {goalId}
          <Icon color="#F0E68C" className="goal-award" iconSize={44} icon={IconNames.BADGE} />
          <div>
            {goalProgress} / {goalTarget} XP
          </div>
        </div>
        <div className="goal-text">{goalText}</div>
      </div>
    );
  };

  const newGoalAdder = () => {
    return (
      <Button
        text={'Add Goal'}
        onClick={() => {
          createNewGoal();
        }}
      />
    );
  };

  return (
    <div>
      <div>
        <Button text={'Edit Goals'} onClick={() => setDialogOpen(!isDialogOpen)} />
      </div>
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title={'Edit Goals'}
        usePortal={false}
      >
        {newGoals.map(goal => mapGoalToJSX(goal))}

        {newGoalAdder()}
      </Dialog>
    </div>
  );
}

export default EditableAchievementGoals;
