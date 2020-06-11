import React, { useState } from 'react';

import AchievementCard from './AchievementCard';
import SubAchievementCard from './SubAchievementCard';
import {
  AchievementItem,
  FilterStatus,
  AchievementStatus
} from '../../../../commons/achievements/AchievementTypes';

type AchievementTaskProps = {
  achievement: AchievementItem;
  achievementDict: { [id: number]: AchievementItem };
  filterStatus: FilterStatus;
  setModal: any;
};

function AchievementTask(props: AchievementTaskProps) {
  const { achievement, achievementDict, filterStatus, setModal } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const togglePrerequisitesDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // AchievementTask decides whether the items should be rendered based on
  // the filterStatus state
  const shouldRender = (achievement: AchievementItem) => {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return true;
      case FilterStatus.ACTIVE:
        return achievement.status === AchievementStatus.ACTIVE;
      case FilterStatus.COMPLETED:
        return achievement.status === AchievementStatus.COMPLETED;
      default:
        return false;
    }
  };

  const shouldRenderPrerequisites = () => {
    return getPrerequisites().reduce((canRender, prerequisite) => {
      return shouldRender(prerequisite) || canRender;
    }, false);
  };

  const getPrerequisites = () => {
    if (achievement.prerequisites === undefined) {
      return [];
    }

    return achievement.prerequisites.map(prerequisiteID => achievementDict[prerequisiteID]);
  };

  const hasPrerequisites = () => {
    return getPrerequisites().length > 0;
  };

  const displayModal = (title: string) => {
    return () => setModal(title);
  };

  // if the main achievement or any of the prerequisites need to be rendered,
  // the whole achievement task will be rendered
  return (
    <>
      {shouldRender(achievement) || shouldRenderPrerequisites() ? (
        <li key={achievement.id}>
          <AchievementCard
            achievement={achievement}
            isTranslucent={!shouldRender(achievement)}
            hasDropdown={hasPrerequisites()}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={togglePrerequisitesDropdown}
            displayModal={displayModal}
          />
          {isDropdownOpen ? (
            <ul>
              {getPrerequisites().map(prerequisite => (
                <li key={prerequisite.id}>
                  <div className="node">
                    <SubAchievementCard
                      achievement={prerequisite}
                      displayModal={displayModal}
                      isTranslucent={!shouldRender(prerequisite)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ) : null}
    </>
  );
}

export default AchievementTask;
