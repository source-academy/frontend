import { Intent, Tag } from '@blueprintjs/core';
import React from 'react';

import { prettifyWeek } from './DateHelper';

type AchievementWeekProps = {
  week?: Date;
  intent: Intent;
};

function AchievementWeek(props: AchievementWeekProps) {
  const { week, intent } = props;

  return (
    <div className="week">
      <div>
        {week === undefined ? null : (
          <Tag intent={intent} round={true}>
            {prettifyWeek(week)}
          </Tag>
        )}
      </div>
    </div>
  );
}

export default AchievementWeek;
