import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type AchievementExpProps = {
  exp?: number;
  isBonus: boolean;
};

function AchievementExp(props: AchievementExpProps) {
  const { exp, isBonus } = props;

  if (exp === undefined || exp === 0) return <div className="exp"></div>;

  // Converts number to EXP string
  const stringifyExp = (exp: number) => {
    return (isBonus ? '+' : '') + exp + ' XP';
  };

  return (
    <div className="exp">
      <Icon icon={IconNames.BANK_ACCOUNT} />
      <p>{stringifyExp(exp)}</p>
    </div>
  );
}

export default AchievementExp;
