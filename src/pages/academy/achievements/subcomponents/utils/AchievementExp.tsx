import React from 'react';

import { Icon, EditableText } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementExpProps = {
  exp?: number;
  changeExpValue?: any;
};

function AchievementExp(props: AchievementExpProps) {
  const { exp, changeExpValue } = props;

  const editEXP = (exp: string) => {
    if (!isNaN(Number(exp))) {
      changeExpValue(Number(exp));
    }
  };

  const makeEXPText = () => {
    if (exp === undefined) {
      return <div className="exp"></div>;
    }

    if (changeExpValue === undefined) {
      return (
        <div className="exp">
          <Icon icon={IconNames.BANK_ACCOUNT} />
          <p>{`${exp} XP`}</p>
        </div>
      );
    }

    return (
      <div className="exp">
        <Icon icon={IconNames.BANK_ACCOUNT} />
        <EditableText value={exp?.toString()} onChange={editEXP} />
        <p>XP</p>
      </div>
    );
  };

  return <>{makeEXPText()}</>;
}

export default AchievementExp;
