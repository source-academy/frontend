import React from 'react';

import { Card } from '@blueprintjs/core';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementHints from '../utils/AchievementHints';
import AchievementProgressBar from '../utils/AchievementProgressBar';
import Inferencer from '../utils/Inferencer';

type PrerequisiteCardProps = {
  id: number;
  inferencer: Inferencer;
  shouldPartiallyRender: boolean;
  displayModal: any;
};

function PrerequisiteCard(props: PrerequisiteCardProps) {
  const { id, inferencer, shouldPartiallyRender, displayModal } = props;

  const { title, release, completionProgress, completionGoal } = inferencer.getAchievementItem(id);

  const totalExp = inferencer.getTotalExp(id);
  const furthestDeadline = inferencer.getFurthestDeadline(id);

  return (
    <div className="node">
      <Card
        className="prerequisite"
        style={{ opacity: shouldPartiallyRender ? '20%' : '100%' }}
        onClick={() => displayModal(id)}
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

              <AchievementDeadline deadline={furthestDeadline} />

              <AchievementExp exp={totalExp} />
            </div>
          </div>
        </div>

        <AchievementProgressBar
          completionProgress={completionProgress}
          completionGoal={completionGoal}
          shouldAnimate={!shouldPartiallyRender}
        />
      </Card>
    </div>
  );
}

export default PrerequisiteCard;
