import React from 'react';

import { Card } from '@blueprintjs/core';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementHints from '../utils/AchievementHints';
import AchievementProgressBar from '../utils/AchievementProgressBar';
import Inferencer from '../utils/Inferencer';

type PrerequisiteCardProps = {
  isLast: boolean;
  id: number;
  inferencer: Inferencer;
  shouldPartiallyRender: boolean;
  displayModal: any;
  handleGlow: any;
};

function PrerequisiteCard(props: PrerequisiteCardProps) {
  const { isLast, id, inferencer, shouldPartiallyRender, displayModal, handleGlow } = props;

  const { title, release, ability, backgroundImageUrl } = inferencer.getAchievementItem(id);

  const exp = inferencer.getExp(id);
  const furthestDeadline = inferencer.getFurthestDeadline(id);
  const progressFrac = inferencer.getProgressFrac(id);

  return (
    <div className="dropdown-expanded">
      <div className="lines">
        <div className="upper"></div>
        {isLast ? <></> : <div className="lower"></div>}
      </div>
      <Card
        className="prerequisite"
        style={{
          ...handleGlow(id),
          opacity: shouldPartiallyRender ? '20%' : '100%',
          background: `url(${backgroundImageUrl})`
        }}
        onClick={() => displayModal(id)}
      >
        <div className="main">
          <div className="padder">
            <p></p>
          </div>

          <div className="display">
            <div className="heading">
              <div className="title">
                <h3>{title}</h3>
              </div>

              <AchievementHints release={release} />
            </div>

            <div className="details">
              <div className="ability">
                <p>{ability}</p>
              </div>

              <AchievementDeadline deadline={furthestDeadline} />

              <AchievementExp exp={exp} />
            </div>
          </div>
        </div>

        <AchievementProgressBar
          progressFrac={progressFrac}
          shouldAnimate={!shouldPartiallyRender}
        />
      </Card>
    </div>
  );
}

export default PrerequisiteCard;
