import React from 'react';
import { Tag, Intent } from '@blueprintjs/core';
import { semester1Weeks } from 'src/commons/mocks/AchievementMocks';

type AchievementHintsProps = {
  release?: Date;
};

function AchievementHints(props: AchievementHintsProps) {
  const { release } = props;

  const oneDayInMilliSeconds = 60 * 60 * 24 * 1000;

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

  const isNewTask = (): boolean => {
    if (release === undefined) {
      return false;
    }

    return Date.now() - release.getTime() <= oneDayInMilliSeconds;
  };

  return (
    <div className="hints">
      <div>
        {isNewTask() ? (
          <Tag round={true} intent={Intent.WARNING}>
            {'NEW'}
          </Tag>
        ) : (
          <></>
        )}
      </div>
      <div>
        {getWeekNumber() === undefined ? (
          <></>
        ) : (
          <Tag round={true}>{`Week ${getWeekNumber()}`}</Tag>
        )}
      </div>
    </div>
  );
}

export default AchievementHints;
