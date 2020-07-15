import { Intent, Tag } from '@blueprintjs/core';
import React from 'react';

import { prettifyWeek } from './DateHelper';

type AchievementWeekProps = {
  week?: Date;
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
