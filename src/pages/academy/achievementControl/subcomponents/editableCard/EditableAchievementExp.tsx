import React from 'react';

import { NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type EditableAchievementExpProps = {
  exp?: number;
  changeExp: any;
};

function EditableAchievementExp(props: EditableAchievementExpProps) {
  const { exp, changeExp } = props;
  // TODO: add regex to only allow numeric input
  return (
    <div className="exp">
      <NumericInput
        buttonPosition={'none'}
        placeholder={'Enter a number here'}
        value={exp}
        onValueChange={changeExp}
        leftIcon={IconNames.BANK_ACCOUNT}
        rightElement={<p>XP</p>}
      />
    </div>
  );
}

export default EditableAchievementExp;
