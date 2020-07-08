import { Intent, Tag } from '@blueprintjs/core';
import React from 'react';
import { semester1Weeks } from 'src/commons/achievements/AchievementTypes';

type AchievementHintsProps = {
  release?: Date;
};

// Converts Date to user friendly week string
export const prettifyWeek = (date: Date) => {
  let week = 0;
  for (const [weekString, startOfTheWeek] of Object.entries(semester1Weeks)) {
    if (date < startOfTheWeek) {
      break;
    }
    week = parseFloat(weekString);
  }
  switch (week) {
    case 6.5:
      return 'Recess Week';
    case 14:
      return 'Reading Week';
    case 15.1:
      return 'Examination Week 1';
    case 15.2:
      return 'Examination Week 2';
    case 16:
      return 'Vacation';
    default:
      return 'Week ' + week;
  }
};

function AchievementHints(props: AchievementHintsProps) {
  const { release } = props;

  return (
    <div className="hints">
      <div>
        {release === undefined ? (
          <></>
        ) : (
          <Tag intent={Intent.WARNING} round={true}>
            {prettifyWeek(release)}
          </Tag>
        )}
      </div>
    </div>
  );
}

export default AchievementHints;
