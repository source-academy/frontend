import React from 'react';

import { Card } from '@blueprintjs/core';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementHints from '../utils/AchievementHints';
import AchievementProgressBar from '../utils/AchievementProgressBar';
import Inferencer from '../utils/Inferencer';

type PrerequisiteCardProps = {
  generateBackgroundGradient: any;
  isLast: boolean;
  id: number;
  inferencer: Inferencer;
  shouldPartiallyRender: boolean;
  displayModal: any;
};

function PrerequisiteCard(props: PrerequisiteCardProps) {
  const {
    generateBackgroundGradient,
    isLast,
    id,
    inferencer,
    shouldPartiallyRender,
    displayModal
  } = props;

  const { title, release, ability, backgroundImageUrl } = inferencer.getAchievementItem(id);

  const totalExp = inferencer.getTotalExp(id);
  const furthestDeadline = inferencer.getFurthestDeadline(id);
  const collectiveProgress = inferencer.getCollectiveProgress(id);

  return (
    <div className="node">
      <div className="lines">
        <div className="upper"></div>
        {isLast ? <></> : <div className="lower"></div>}
      </div>
      <Card
        className="prerequisite"
        style={{
          opacity: shouldPartiallyRender ? '20%' : '100%',
          background: `${generateBackgroundGradient(ability)}, url(${backgroundImageUrl})`
        }}
        onClick={() => displayModal(id)}
      >
        <div className="main">
          <div className="padder">
            <p></p>
          </div>

          <div className="display">
            <div className="headings">
              <div className="title">
                <h1>{title}</h1>
              </div>

              <AchievementHints release={release} />
            </div>

            <div className="details">
              <div className="ability">
                <p>{ability}</p>
              </div>

              <AchievementDeadline deadline={furthestDeadline} />

              <AchievementExp exp={totalExp} />
            </div>
          </div>
        </div>

        <AchievementProgressBar
          progress={collectiveProgress}
          shouldAnimate={!shouldPartiallyRender}
        />
      </Card>
    </div>
  );
}

export default PrerequisiteCard;
