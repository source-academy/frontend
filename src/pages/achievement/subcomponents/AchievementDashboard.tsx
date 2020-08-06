import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useState } from 'react';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { Role, UserSimpleState } from '../../../commons/application/ApplicationTypes';
import Constants from '../../../commons/utils/Constants';
import { FilterColors, getAbilityGlow } from '../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  FilterStatus,
  GoalProgress
} from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
  handleUsersFetch: () => void;
  updateGoalProgress: (studentId: number, progress: GoalProgress) => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
  name?: string;
  role?: Role;
  group: string | null;
  users: UserSimpleState[];
};

function Dashboard(props: DispatchProps & StateProps) {
  const {
    inferencer,
    name,
    role,
    group,
    users,
    handleAchievementsFetch,
    handleUsersFetch,
    updateGoalProgress
  } = props;

  useEffect(() => {
    if (Constants.useBackend) {
      if (role !== Role.Student) {
        handleUsersFetch();
      }

      handleAchievementsFetch();
    }
  }, [handleAchievementsFetch, handleUsersFetch, role]);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [viewId, setViewId] = useState<number>(-1);

  const [filteredUserName, setFilteredUserName] = useState<string>(
    role === Role.Student ? name! : ''
  );
  const [filteredUserGroup, setFileredUserGroup] = useState<string>(
    role === Role.Student ? group! : ''
  );

  // Filter icon turns blue when selected, otherwise white
  const getFilterColor = (status: FilterStatus) =>
    status === filterStatus ? FilterColors.BLUE : FilterColors.WHITE;

  // Make Flex achievements parmanently glowing and the selected achievement glow
  const handleGlow = (id: number) => {
    const ability = inferencer.getAchievementItem(id).ability;
    return ability === AchievementAbility.FLEX || id === viewId
      ? getAbilityGlow(ability)
      : undefined;
  };

  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        filterStatus={filterStatus}
        displayView={setViewId}
        handleGlow={handleGlow}
      />
    ));

  return (
    <div className="AchievementDashboard">
      <AchievementOverview
        name={name || 'User'}
        role={role}
        studio={group || 'Staff'}
        users={users}
        inferencer={inferencer}
        filteredUserName={filteredUserName}
        setFilteredUserName={setFilteredUserName}
        filteredUserGroup={filteredUserGroup}
        setFileredUserGroup={setFileredUserGroup}
      />

      <div className="achievement-main">
        <div className="filter-container">
          <AchievementFilter
            filterStatus={FilterStatus.ALL}
            setFilterStatus={setFilterStatus}
            icon={IconNames.GLOBE}
            count={inferencer.getFilterCount(FilterStatus.ALL)}
            getFilterColor={getFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.ACTIVE}
            setFilterStatus={setFilterStatus}
            icon={IconNames.LOCATE}
            count={inferencer.getFilterCount(FilterStatus.ACTIVE)}
            getFilterColor={getFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.COMPLETED}
            setFilterStatus={setFilterStatus}
            icon={IconNames.ENDORSED}
            count={inferencer.getFilterCount(FilterStatus.COMPLETED)}
            getFilterColor={getFilterColor}
          />
        </div>

        <ul className="list-container">
          {mapAchievementIdsToTasks(inferencer.listTaskIdsbyPosition())}
        </ul>

        <div className="view-container">
          <AchievementView
            users={users.filter(user => user.name === filteredUserName)}
            id={viewId}
            role={role}
            inferencer={inferencer}
            handleGlow={handleGlow}
            updateGoalProgress={updateGoalProgress}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
