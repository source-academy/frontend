import { Icon, Intent, ProgressBar } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { AchievementStatus } from 'src/commons/achievement/AchievementTypes';

import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementWeek from '../utils/AchievementWeek';
import Inferencer from '../utils/Inferencer';

type AchievementCardProps = {
  id: number;
  inferencer: Inferencer;
  shouldPartiallyRender: boolean;
  isDropdownOpen: boolean;
  toggleDropdown: any;
  displayModal: any;
  handleGlow: any;
};

function AchievementCard(props: AchievementCardProps) {
  const {
    id,
    inferencer,
    shouldPartiallyRender,
    isDropdownOpen,
    toggleDropdown,
    displayModal,
    handleGlow
  } = props;

  const { title, ability, release, backgroundImageUrl } = inferencer.getAchievementItem(id);

  const status = inferencer.getStatus(id);
  const displayExp = inferencer.getDisplayExp(id);
  const displayDeadline = inferencer.getDisplayDeadline(id);
  const progressFrac = inferencer.getProgressFrac(id);

  const hasDropdown: boolean = inferencer.getImmediateChildren(id).size > 0;

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
      {hasDropdown ? (
        <div className="dropdown-button">
          <Icon icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
        </div>
      ) : (
        <div className="dropdown-button"></div>
      )}

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
