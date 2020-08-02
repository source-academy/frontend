import { Icon, Intent, ProgressBar } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import AchievementDeadline from './utils/AchievementDeadline';
import AchievementExp from './utils/AchievementExp';
import AchievementInferencer from './utils/AchievementInferencer';

type AchievementCardProps = {
  id: number;
  inferencer: AchievementInferencer;
  shouldPartiallyRender: boolean;
  displayView: any;
  handleGlow: any;
  isDropdownOpen?: boolean;
  toggleDropdown?: any;
};

function AchievementCard(props: AchievementCardProps) {
  const {
    id,
    inferencer,
    shouldPartiallyRender,
    displayView,
    handleGlow,
    isDropdownOpen,
    toggleDropdown
  } = props;

  const { title, ability, cardTileUrl } = inferencer.getAchievementItem(id);

  const status = inferencer.getStatus(id);
  const displayDeadline = inferencer.getDisplayDeadline(id);
  const progressFrac = inferencer.getProgressFrac(id);

  // Only task card with prerequisites has dropdown button
  const hasDropdown =
    isDropdownOpen !== undefined && inferencer.getImmediateChildren(id).size !== 0;

  const displayExp = hasDropdown ? inferencer.getBonusExp(id) : inferencer.getDisplayExp(id);

  return (
    <div
      className="achievement-card"
      style={{
        ...handleGlow(id),
        opacity: shouldPartiallyRender ? '20%' : '100%',
        background: `url(${cardTileUrl}) center/cover`
      }}
      onClick={() => displayView(id)}
      onClickCapture={toggleDropdown}
    >
      <div className="dropdown-button">
        {hasDropdown ? (
          <Icon icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
        ) : null}
      </div>

      <div className="content">
        <div className="heading">
          <h3>{title.toUpperCase()}</h3>
          <span className="status">
            {status === AchievementStatus.COMPLETED && (
              <Icon icon={IconNames.CONFIRM} intent={Intent.SUCCESS} style={{ padding: '1em' }} />
            )}
          </span>
        </div>

        <div className="details">
          <div className="ability">
            <p>{ability}</p>
          </div>
          <AchievementDeadline deadline={displayDeadline} ability={ability} />
          <AchievementExp exp={displayExp} isBonus={hasDropdown} />
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
  );
}

export default AchievementCard;
