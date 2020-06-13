import React from 'react';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementModalExpProps = {
  exp?: number;
};

function AchievementModalExp(props: AchievementModalExpProps) {
  const { exp } = props;

  return (
    <>
      {exp === undefined ? (
        <div></div>
      ) : (
        <div className="modal-exp">
          <Icon icon={IconNames.BANK_ACCOUNT} />
          <p>{`${exp} XP`}</p>
        </div>
      )}
    </>
  );
}

export default AchievementModalExp;
