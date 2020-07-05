import React from 'react';
import { Tag, Intent } from '@blueprintjs/core';
import { semester1Weeks } from '../../../../commons/mocks/AchievementMocks';

type AchievementHintsProps = {
  release?: Date;
};

function AchievementHints(props: AchievementHintsProps) {
  const { release } = props;

  const getWeekNumber = (): number | undefined => {
    if (release === undefined) {
      return undefined;
    }

    for (const date in semester1Weeks) {
      if (release <= semester1Weeks[date]) {
        return parseInt(date) - 1;
      }
    }

    return 13;
  };

  return (
    <div className="hints">
      <div>
        {getWeekNumber() === undefined ? (
          <></>
        ) : (
          <Tag intent={Intent.WARNING} round={true}>{`Week ${getWeekNumber()}`}</Tag>
        )}
      </div>
    </div>
  );
}

export default AchievementHints;
