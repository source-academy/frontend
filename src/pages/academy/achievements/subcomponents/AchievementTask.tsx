import React, { useState } from 'react';

import AchievementCard from './cards/AchievementCard';
import PrerequisiteCard from './cards/PrerequisiteCard';
import {
  AchievementItem,
  FilterStatus,
  AchievementStatus
} from '../../../../commons/achievements/AchievementTypes';

type AchievementTaskProps = {
  achievement: AchievementItem;
  achievementDict: { [id: number]: AchievementItem };
  filterStatus: FilterStatus;
  setModalID: any;
};

function AchievementTask(props: AchievementTaskProps) {
  const { achievement, achievementDict, filterStatus, setModalID } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const togglePrerequisitesDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  /**
   * Checks whether the AchievementItem should be rendered based on
   * the achivement page filterStatus.
   *
   * @param {AchievementItem} achievement The achievement item
   */
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

  /**
   * Checks whether the achievement item has any prerequisite item that
   * should be rendered based on the achievement page filterStatus.
   *
   * If there is at least 1 prerequisite that needs to be rendered,
   * the whole AchievementTask will be rendered together.
   *
   * @param {AchievementItem} achievement The achievement item
   */
  const shouldRenderPrerequisites = (achievement: AchievementItem) => {
    return getPrerequisites(achievement).reduce((canRender, prerequisite) => {
      return shouldRender(prerequisite) || canRender;
    }, false);
  };

  // Returns an array of prerequisites of the AchievementItem
  const getPrerequisites = (achievement: AchievementItem) => {
    if (achievement.prerequisites === undefined) {
      return [];
    }

    return achievement.prerequisites.map(prerequisiteID => achievementDict[prerequisiteID]);
  };

  const hasPrerequisites = (achievement: AchievementItem) => {
    return getPrerequisites(achievement).length > 0;
  };

  // TODO: Put these helper functions in a separate file.
  const mapPrerequisitesToDeadlines = (
    achievement: AchievementItem,
    prerequisites: AchievementItem[]
  ) => {
    return prerequisites.map(prerequisite => {
      if (hasPrerequisites(prerequisite)) {
        return calculatLatesteDeadline(achievement, getPrerequisites(prerequisite));
      }

      return prerequisite.deadline;
    });
  };

  const calculatLatesteDeadline = (
    achievement: AchievementItem,
    prerequisites: AchievementItem[]
  ): Date | undefined => {
    if (prerequisites.length === 0) {
      return achievement.deadline;
    }

    const latestDeadline = mapPrerequisitesToDeadlines(achievement, prerequisites).reduce(
      (latestDate, deadline) => {
        if (deadline === undefined) {
          return latestDate;
        }

        if (latestDate === undefined) {
          return deadline;
        }

        return deadline.getTime() > latestDate.getTime() ? deadline : latestDate;
      }
    );

    // console.log(`${achievement.title} : ${achievement.deadline} : ${latestDeadline}`);

    if (latestDeadline && !achievement.deadline) {
      return latestDeadline;
    }

    return achievement.deadline;
  };

  const displayModal = (modalID: number) => {
    return () => setModalID(modalID);
  };

  // if the main achievement or any of the prerequisites need to be rendered,
  // the whole achievement task will be rendered
  return (
    <>
      {shouldRender(achievement) || shouldRenderPrerequisites(achievement) ? (
        <li key={achievement.id}>
          <AchievementCard
            achievement={achievement}
            deadline={calculatLatesteDeadline(achievement, getPrerequisites(achievement))}
            isTranslucent={!shouldRender(achievement)}
            hasDropdown={hasPrerequisites(achievement)}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={togglePrerequisitesDropdown}
            displayModal={displayModal}
          />
          {isDropdownOpen ? (
            <ul>
              {getPrerequisites(achievement).map(prerequisite => (
                <li key={prerequisite.id}>
                  <div className="node">
                    <PrerequisiteCard
                      achievement={prerequisite}
                      deadline={calculatLatesteDeadline(
                        prerequisite,
                        getPrerequisites(prerequisite)
                      )}
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
