import { Icon, Intent, ProgressBar } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';
import { AchievementContext, handleGlow } from 'src/features/achievement/AchievementConstants';

import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import AchievementDeadline from './card/AchievementDeadline';
import AchievementXp from './card/AchievementXp';

type AchievementCardProps = {
  id: number;
  focusState: [number, any];
  isDropdownOpen?: boolean;
  shouldRender: boolean;
  toggleDropdown?: () => void;
};

function AchievementCard(props: AchievementCardProps) {
  const { id, focusState, isDropdownOpen, shouldRender, toggleDropdown } = props;

  const inferencer = useContext(AchievementContext);

  const [focusId, setFocusId] = focusState;

  const { ability, cardBackground, title } = inferencer.getAchievement(id);
  const displayDeadline = inferencer.getDisplayDeadline(id);
  const displayXp = inferencer.getAchievementMaxXp(id);
  const progressFrac = inferencer.getProgressFrac(id);
  const status = inferencer.getStatus(id);

  // Only task card with prerequisites has dropdown button
  const hasDropdown =
    isDropdownOpen !== undefined && inferencer.getImmediateChildren(id).size !== 0;

  return (
    <div
      className="achievement-card"
      onClick={() => setFocusId(id)}
      onClickCapture={toggleDropdown}
      style={{
        ...handleGlow(id, focusId, ability),
        opacity: shouldRender ? '100%' : '20%',
        background: `url(${cardBackground}) center/cover`
      }}
    >
      <div className="dropdown-button">
        {hasDropdown && (
          <Icon icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
        )}
      </div>

      <div className="content">
        <div className="heading">
          <h3>{title.toUpperCase()}</h3>
          {status === AchievementStatus.COMPLETED && (
            <Icon icon={IconNames.CONFIRM} intent={Intent.SUCCESS} style={{ padding: '1em' }} />
          )}
        </div>

        <div className="details">
          <div className="ability">
            <p>{ability}</p>
          </div>
          <AchievementDeadline ability={ability} deadline={displayDeadline} />
          <AchievementXp isBonus={hasDropdown} xp={displayXp} />
        </div>

        <ProgressBar
          animate={false}
          className="progress"
          intent={progressFrac === 1 ? 'success' : undefined}
          stripes={false}
          value={progressFrac}
        />
      </div>
    </div>
  );
}

export default AchievementCard;
