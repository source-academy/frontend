import { Intent, Tag } from '@blueprintjs/core';
import React from 'react';
import { semester1Weeks } from 'src/commons/achievements/AchievementTypes';

type AchievementWeekProps = {
  week?: Date;
};

// Converts Date to user friendly week string
export const prettifyWeek = (date: Date) => {
  let week = 0;
  for (const [key, startOfTheWeek] of semester1Weeks.entries()) {
    if (date < startOfTheWeek) {
      break;
    }
    week = key;
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

function AchievementWeek(props: AchievementWeekProps) {
  const { week } = props;

  return (
    <div className="week">
      <div>
        {week === undefined ? null : (
          <Tag intent={Intent.WARNING} round={true}>
            {prettifyWeek(week)}
          </Tag>
        )}
      </div>
    </div>
  );
}

export default AchievementWeek;
