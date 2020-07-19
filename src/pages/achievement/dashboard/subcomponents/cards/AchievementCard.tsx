import { Icon, Intent, ProgressBar } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { AchievementStatus } from '../../../../../features/achievement/AchievementTypes';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementInferencer from '../utils/AchievementInferencer';
import AchievementWeek from '../utils/AchievementWeek';

type AchievementCardProps = {
  id: number;
  inferencer: AchievementInferencer;
  shouldPartiallyRender: boolean;
  displayModal: any;
  handleGlow: any;
  isDropdownOpen?: boolean;
  toggleDropdown?: any;
};

function AchievementCard(props: AchievementCardProps) {
  const {
    id,
    inferencer,
    shouldPartiallyRender,
    displayModal,
    handleGlow,
    isDropdownOpen,
    toggleDropdown
  } = props;

  const { title, ability, release, backgroundImageUrl } = inferencer.getAchievementItem(id);

  const status = inferencer.getStatus(id);
  const displayExp = inferencer.getDisplayExp(id);
  const displayDeadline = inferencer.getDisplayDeadline(id);
  const progressFrac = inferencer.getProgressFrac(id);

  // Only task card with prerequisites has dropdown button
  const hasDropdown =
    isDropdownOpen !== undefined && inferencer.getImmediateChildren(id).size !== 0;

  return (
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
          {status === AchievementStatus.COMPLETED ? (
            <Icon icon={IconNames.CONFIRM} intent={Intent.SUCCESS} style={{ paddingLeft: '1em' }} />
          ) : (
            <AchievementWeek week={release} intent={Intent.WARNING} />
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
  );
}

export default AchievementCard;
