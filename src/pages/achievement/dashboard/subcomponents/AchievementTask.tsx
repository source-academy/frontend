import React, { useState } from 'react';

import { AchievementStatus, FilterStatus } from '../../../../features/achievement/AchievementTypes';
import AchievementCard from './cards/AchievementCard';
import AchievementInferencer from './utils/AchievementInferencer';

type AchievementTaskProps = {
  id: number;
  inferencer: AchievementInferencer;
  filterStatus: FilterStatus;
  displayView: any;
  handleGlow: any;
};

function AchievementTask(props: AchievementTaskProps) {
  const { id, inferencer, filterStatus, displayView, handleGlow } = props;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  /**
   * Checks whether the AchievementItem (can be a task or prereq) should be rendered
   * based on the achivement page filterStatus.
   */
  const shouldRender = (id: number): boolean => {
    const status = inferencer.getStatus(id);
    switch (filterStatus) {
      case FilterStatus.ALL:
        return true;
      case FilterStatus.ACTIVE:
        return status === AchievementStatus.ACTIVE;
      case FilterStatus.COMPLETED:
        return status === AchievementStatus.COMPLETED;
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
   */
  const shouldRenderPrerequisites = (id: number) => {
    const children = inferencer.listImmediateChildren(id);
    return children.reduce((canRender, prerequisite) => {
      return canRender || shouldRender(prerequisite);
    }, false);
  };

  /**
   * If the main achievement or any of the prerequisites need to be rendered,
   * the whole achievement task will be rendered
   */
  const shouldRenderTask = (id: number) => shouldRender(id) || shouldRenderPrerequisites(id);

  return (
    <>
      {shouldRenderTask(id) && (
        <li key={id}>
          <AchievementCard
            id={id}
            inferencer={inferencer}
            shouldPartiallyRender={!shouldRender(id)}
            displayView={displayView}
            handleGlow={handleGlow}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="prerequisite-container">
              {inferencer.listImmediateChildren(id).map(prerequisite => (
                <div className="prerequisite" key={prerequisite}>
                  <div className="dropdown-lines"></div>
                  <AchievementCard
                    id={prerequisite}
                    inferencer={inferencer}
                    shouldPartiallyRender={!shouldRender(prerequisite)}
                    displayView={displayView}
                    handleGlow={handleGlow}
                  />
                </div>
              ))}
            </div>
          )}
        </li>
      )}
    </>
  );
}

export default AchievementTask;
