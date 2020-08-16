import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type AchievementXpProps = {
  xp: number;
  isBonus: boolean;
};

const stringifyXp = (xp: number, isBonus: boolean) => {
  return (isBonus ? '+' : '') + xp + ' XP';
};

function AchievementXp(props: AchievementXpProps) {
  const { xp, isBonus } = props;

  return (
    <div className="xp">
      {xp !== 0 && (
        <>
          <Icon icon={IconNames.BANK_ACCOUNT} />
          <p>{stringifyXp(xp, isBonus)}</p>
        </>
      )}
    </div>
  );
}

export default AchievementXp;
