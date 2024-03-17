import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

const stringifyXp = (xp: number, isBonus: boolean) => {
  return (isBonus ? 'Total ' : '') + xp + ' XP';
};

type Props = {
  isBonus: boolean;
  xp: number;
};

const AchievementXp: React.FC<Props> = ({ isBonus, xp }) => {
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
};

export default AchievementXp;
