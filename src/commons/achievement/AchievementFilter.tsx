import { Icon, type IconName } from '@blueprintjs/core';

import { getFilterColor } from '../../features/achievement/AchievementConstants';
import { FilterStatus } from '../../features/achievement/AchievementTypes';

type Props = {
  filterState: [FilterStatus, any];
  icon: IconName;
  ownStatus: FilterStatus;
};

function AchievementFilter({ filterState, icon, ownStatus }: Props) {
  const [globalStatus, setGlobalStatus] = filterState;

  return (
    <div
      className="filter"
      onClick={() => setGlobalStatus(ownStatus)}
      style={{ color: getFilterColor(globalStatus, ownStatus) }}
    >
      <Icon icon={icon} size={30} />
      <p>{ownStatus}</p>
    </div>
  );
}

export default AchievementFilter;
