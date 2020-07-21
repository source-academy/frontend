import { Icon, Intent, ProgressBar } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { AchievementStatus } from '../../../../../features/achievement/AchievementTypes';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementInferencer from '../utils/AchievementInferencer';

type PrerequisiteCardProps = {
  isLast: boolean;
  id: number;
  inferencer: AchievementInferencer;
  shouldPartiallyRender: boolean;
  displayView: any;
  handleGlow: any;
};

function PrerequisiteCard(props: PrerequisiteCardProps) {
  const { isLast, id, inferencer, shouldPartiallyRender, displayView, handleGlow } = props;

  const { title, ability, cardTileUrl } = inferencer.getAchievementItem(id);

  const status = inferencer.getStatus(id);
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
          background: `url(${cardTileUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={() => displayView(id)}
      >
        <div className="dropdown-button"></div>

        <div className="content">
          <div className="heading">
            <h3>{title.toUpperCase()}</h3>
            {status === AchievementStatus.COMPLETED && (
              <Icon
                icon={IconNames.CONFIRM}
                intent={Intent.SUCCESS}
                style={{ paddingLeft: '1em' }}
              />
            )}
          </div>

          <div className="details">
            <div className="ability">
              <p>{ability}</p>
            </div>

            <AchievementDeadline deadline={displayDeadline} ability={ability} />

            <AchievementExp exp={displayExp} />
          </div>

          <ProgressBar
            className="progress"
            intent={progressFrac === 1 ? 'success' : undefined}
            value={progressFrac}
            animate={false}
            stripes={false}
          />
        </div>
      </div>
    </div>
  );
}

export default PrerequisiteCard;
