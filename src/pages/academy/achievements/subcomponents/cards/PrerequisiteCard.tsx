import React from 'react';

import { Card } from '@blueprintjs/core';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import AchievementHints from '../utils/AchievementHints';
import AchievementProgressBar from '../utils/AchievementProgressBar';

type PrerequisiteCardProps = {
  achievement: AchievementItem;
  exp?: number;
  deadline?: Date;
  release?: Date;
  progress: number;
  shouldPartiallyRender: boolean;
  displayModal: any;
};

function PrerequisiteCard(props: PrerequisiteCardProps) {
  const { achievement, exp, deadline, progress, shouldPartiallyRender, displayModal } = props;
  const { id, title, release } = achievement;

  return (
    <Card
      className="prerequisite"
      style={{ opacity: shouldPartiallyRender ? '20%' : '100%' }}
      onClick={displayModal(id)}
    >
      <AchievementHints release={release} />

      <div className="main">
        <div className="display">
          <div>
            <h3>{title}</h3>
          </div>

          <div className="details">
            <div className="path">
              <p></p>
            </div>

            <AchievementDeadline deadline={deadline} />

            <AchievementExp exp={exp} />
          </div>
        </div>
      </div>

      <AchievementProgressBar value={progress} shouldAnimate={!shouldPartiallyRender} />
    </Card>
  );
}

export default PrerequisiteCard;
