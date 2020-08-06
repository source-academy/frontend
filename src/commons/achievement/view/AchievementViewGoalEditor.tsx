import { Button, Dialog, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';

import { AchievementGoal } from '../../../features/achievement/AchievementTypes';
import { UserSimpleState } from '../../application/ApplicationTypes';
import { showWarningMessage } from '../../utils/NotificationsHelper';

type AchievementViewGoalEditorProps = {
  goal: AchievementGoal;
  userToEdit: UserSimpleState | null;

  updateGoalProgress: any;
};

function AchievementViewGoalEditor(props: AchievementViewGoalEditorProps) {
  const { userToEdit, goal /* updateGoalProgress */ } = props;
  const { exp, maxExp } = goal;

  const [currentExp, setCurrentExp] = useState<number>(exp);
  const [isOpen, setOpen] = useState<boolean>(false);

  const openDialog = () => {
    if (userToEdit !== null) {
      setOpen(true);
    } else {
      showWarningMessage('Please Select a User first!');
    }
  };

  const verifyandEdit = (exp: string) => {
    const expAsInteger = parseInt(exp);

    console.log(expAsInteger);

    if (isNaN(expAsInteger)) {
      setCurrentExp(0);
    } else if (expAsInteger >= maxExp) {
      setCurrentExp(currentExp);
    } else {
      setCurrentExp(expAsInteger);
    }
  };

  const saveGoalProgress = () => {
    /*  TODO: Implement this when backend is ready!

    const goalCopy = { ...goal };
    goalCopy.exp = currentExp;
    updateGoalProgress(userToEdit?.userId, goalCopy);
    */
  };

  return (
    <div className="goal-editor">
      <Button text={`Edit`} onClick={openDialog} />
      <div>
        <Dialog onClose={() => setOpen(false)} isOpen={isOpen} title={`Edit Goal Exp`}>
          <p> Max EXP: {maxExp}</p>
          <br />
          <EditableText value={`${currentExp}`} onChange={(exp: string) => verifyandEdit(exp)} />
          <Button text={`Save`} onClick={saveGoalProgress} />
        </Dialog>
      </div>
    </div>
  );
}

export default AchievementViewGoalEditor;
