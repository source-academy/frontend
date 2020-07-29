import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type AchievementExpProps = {
  exp?: number;
};

function AchievementExp(props: AchievementExpProps) {
  const { exp } = props;

  // Converts number to EXP string
  const stringifyExp = (exp: number | undefined) => {
    return exp === undefined ? 'No XP' : exp + ' XP';
  };

  return (
    <div className="exp">
      <Icon icon={IconNames.BANK_ACCOUNT} />
      <p>{stringifyExp(exp)}</p>
    </div>
  );
}

export default AchievementExp;
