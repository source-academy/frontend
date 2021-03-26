import { Icon, IconName } from '@blueprintjs/core';

import { getFilterColor } from '../../features/achievement/AchievementConstants';
import { FilterStatus } from '../../features/achievement/AchievementTypes';

type AchievementFilterProps = {
  filterState: [FilterStatus, any];
  icon: IconName;
  ownStatus: FilterStatus;
};

function AchievementFilter(props: AchievementFilterProps) {
  const { filterState, icon, ownStatus } = props;

  const [globalStatus, setGlobalStatus] = filterState;

  return (
    <div
      className="filter"
      onClick={() => setGlobalStatus(ownStatus)}
      style={{ color: getFilterColor(globalStatus, ownStatus) }}
    >
      <Icon icon={icon} iconSize={30} />
      <p>{ownStatus}</p>
    </div>
  );
}

export default AchievementFilter;
