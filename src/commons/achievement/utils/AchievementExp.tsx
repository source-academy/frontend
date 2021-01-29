import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementExpProps = {
  exp: number;
  isBonus: boolean;
};

const stringifyExp = (exp: number, isBonus: boolean) => {
  return (isBonus ? '+' : '') + exp + ' XP';
};

function AchievementExp(props: AchievementExpProps) {
  const { exp, isBonus } = props;

  return (
    <div className="exp">
      {exp !== 0 && (
        <>
          <Icon icon={IconNames.BANK_ACCOUNT} />
          <p>{stringifyExp(exp, isBonus)}</p>
        </>
      )}
    </div>
  );
}

export default AchievementExp;
