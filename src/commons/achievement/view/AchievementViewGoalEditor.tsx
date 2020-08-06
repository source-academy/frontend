import { Button, Dialog, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';

import { UserSimpleState } from '../../application/ApplicationTypes';
import { showWarningMessage } from '../../utils/NotificationsHelper';

type AchievementViewGoalEditorProps = {
  id: number;
  exp: number;
  maxExp: number;
  userToEdit: UserSimpleState | null;
};

function AchievementViewGoalEditor(props: AchievementViewGoalEditorProps) {
  const { userToEdit, exp, maxExp } = props;

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

  return (
    <div className="goal-editor">
      <Button text={`Edit`} onClick={openDialog} />
      <div>
        <Dialog onClose={() => setOpen(false)} isOpen={isOpen} title={`Edit Goal Exp`}>
          <p> Max EXP: {maxExp}</p>
          <br />
          <EditableText value={`${currentExp}`} onChange={(exp: string) => verifyandEdit(exp)} />
          <Button text={`Save`} onClick={() => {}} />
        </Dialog>
      </div>
    </div>
  );
}

export default AchievementViewGoalEditor;
