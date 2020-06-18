import React from 'react';
import { Tag, Intent } from '@blueprintjs/core';

function AchievementHints() {

  return (
    <div className="hints">
      <div>
        <Tag round={true} intent={Intent.WARNING}>
          {'NEW'}
        </Tag>
      </div>
      <div>
        <Tag round={true}>{'Week 1'}</Tag>
      </div>
    </div>
  );
}

export default AchievementHints;
