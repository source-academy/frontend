import React, { useState } from 'react';
import { AchievementGoal } from 'src/commons/achievements/AchievementTypes';
import { Button, Dialog } from '@blueprintjs/core';
import EditableAchievementGoal from './EditableAchievementGoal';

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

  const editGoal = (goal: AchievementGoal) => {
    newGoals[goal.goalId] = goal;
    setNewGoals(newGoals);
    editGoals(newGoals);
  };

  const removeGoal = (goal: AchievementGoal) => {
    newGoals.splice(goal.goalId, 1);
    for (let id = 0; id < newGoals.length; id++) {
      newGoals[id].goalId = id;
    }

    setNewGoals(newGoals);
    editGoals(newGoals);
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
        {newGoals.map(goal => (
          <EditableAchievementGoal goal={goal} editGoal={editGoal} removeGoal={removeGoal} />
        ))}

        {newGoalAdder()}
      </Dialog>
    </div>
  );
}

export default EditableAchievementGoals;
