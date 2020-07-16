import React from 'react';

import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementProgressBar from '../utils/AchievementProgressBar';
import AchievementWeek from '../utils/AchievementWeek';
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

  const displayExp = inferencer.getDisplayExp(id);
  const displayDeadline = inferencer.getDisplayDeadline(id);
  const progressFrac = inferencer.getProgressFrac(id);

  return (
    <div className="dropdown-container">
      <div className="lines">
        <div className="l-shape"></div>
        {isLast ? <></> : <div className="extend-bottom"></div>}
      </div>
      <div
        className="achievement-card"
        style={{
          ...handleGlow(id),
          opacity: shouldPartiallyRender ? '20%' : '100%',
          background: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={() => displayModal(id)}
      >
        <div className="dropdown-button"></div>

        <div className="content">
          <div className="heading">
            <h3>{title.toUpperCase()}</h3>
            <AchievementWeek week={release} />
          </div>

          <div className="details">
            <div className="ability">
              <p>{ability}</p>
            </div>

            <AchievementDeadline deadline={displayDeadline} />

            <AchievementExp exp={displayExp} />
          </div>

          <AchievementProgressBar
            progressFrac={progressFrac}
            shouldAnimate={!shouldPartiallyRender}
          />
        </div>
      </div>
    </div>
  );
}

export default PrerequisiteCard;
