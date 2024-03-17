import { Icon, Intent, ProgressBar } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';
import { AchievementContext, handleGlow } from 'src/features/achievement/AchievementConstants';

import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import AchievementDeadline from './card/AchievementDeadline';
import AchievementXp from './card/AchievementXp';

type Props = {
  uuid: string;
  focusState: [string, any];
  isDropdownOpen?: boolean;
  shouldRender: boolean;
  toggleDropdown?: () => void;
};

const AchievementCard: React.FC<Props> = ({
  uuid,
  focusState,
  isDropdownOpen,
  shouldRender,
  toggleDropdown
}) => {
  const inferencer = useContext(AchievementContext);

  const [focusUuid, setFocusUuid] = focusState;

  const { cardBackground, title } = inferencer.getAchievement(uuid);
  const displayDeadline = inferencer.getDisplayDeadline(uuid);
  const displayXp = inferencer.getDescendantXp(uuid);
  const progressFrac = inferencer.getProgressFrac(uuid);
  const status = inferencer.getStatus(uuid);

  // Only task card with prerequisites has dropdown button
  const hasDropdown =
    isDropdownOpen !== undefined && inferencer.getImmediateChildren(uuid).size !== 0;

  return (
    <div
      className="achievement-card"
      onClick={() => setFocusUuid(uuid)}
      onClickCapture={toggleDropdown}
      style={{
        ...handleGlow(uuid, focusUuid),
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
          <AchievementDeadline deadline={displayDeadline} />
          <AchievementXp isBonus={hasDropdown} xp={displayXp} />
        </div>

        <ProgressBar
          animate={false}
          className="progress"
          intent={progressFrac === 1 ? 'success' : 'primary'}
          stripes={false}
          value={progressFrac}
        />
      </div>
    </div>
  );
};

export default AchievementCard;
