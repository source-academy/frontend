import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const stringifyXp = (xp: number, isBonus: boolean) => {
  return (isBonus ? 'Total ' : '') + xp + ' XP';
};

type Props = {
  isBonus: boolean;
  xp: number;
};

function AchievementXp({ isBonus, xp }: Props) {
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
