import { InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type EditableExpProps = {
  exp: number;
  changeExp: any;
};

function EditableExp(props: EditableExpProps) {
  const { exp, changeExp } = props;

  return (
    <div className="exp">
      <InputGroup
        placeholder={'Enter a number here'}
        value={exp.toString()}
        onChange={(event: any) => changeExp(event.target.value)}
        leftIcon={IconNames.BANK_ACCOUNT}
        rightElement={<p>XP</p>}
      />
    </div>
  );
}

export default EditableExp;
