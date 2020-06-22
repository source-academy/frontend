import React from 'react';

import { IconNames } from '@blueprintjs/icons';
import { InputGroup } from '@blueprintjs/core';

type EditableAchievementExpProps = {
  exp?: number;
  changeExp: any;
};

function EditableAchievementExp(props: EditableAchievementExpProps) {
  const { exp, changeExp } = props;

  return (
    <div className="exp">
      <InputGroup
        placeholder={'Enter a number here'}
        value={exp?.toString()}
        onChange={(e: any) => changeExp(e.target.value)}
        leftIcon={IconNames.BANK_ACCOUNT}
        rightElement={<p>XP</p>}
      />
    </div>
  );
}

export default EditableAchievementExp;
