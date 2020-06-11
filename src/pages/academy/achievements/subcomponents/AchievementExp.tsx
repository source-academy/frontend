import React from 'react';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementExpProps = {
  exp?: number;
};

function AchievementExp(props: AchievementExpProps) {
  const { exp } = props;

  return (
    <>
      {exp === undefined ? (
        <div className="exp"></div>
      ) : (
        <div className="exp">
          <Icon icon={IconNames.BANK_ACCOUNT} />
          <p>{`${exp} XP`}</p>
        </div>
      )}
    </>
  );
}

export default AchievementExp;
