import React, { useState } from 'react';

import AchievementCard from './cards/AchievementCard';
import PrerequisiteCard from './cards/PrerequisiteCard';
import Inferencer from './utils/Inferencer';
import { FilterStatus, AchievementStatus } from '../../../commons/achievements/AchievementTypes';

type AchievementTaskProps = {
  id: number;
  inferencer: Inferencer;
  filterStatus: FilterStatus;
  displayModal: any;
};

function AchievementTask(props: AchievementTaskProps) {
  const { id, inferencer, filterStatus, displayModal } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  /* -------- Helper for Renderer -------- */

  /**
   * Checks whether the AchievementItem (can be a task or prereq) should be rendered based on
   * the achivement page filterStatus.
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

  const shouldRenderTask = (id: number) => shouldRender(id) || shouldRenderPrerequisites(id);

  // if the main achievement or any of the prerequisites need to be rendered,
  // the whole achievement task will be rendered
  return (
    <>
      {shouldRenderTask(id) ? (
        <li key={id}>
          <AchievementCard
            id={id}
            inferencer={inferencer}
            shouldPartiallyRender={!shouldRender(id)}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            displayModal={displayModal}
          />
          {isDropdownOpen ? (
            <ul>
              {inferencer.listImmediateChildren(id).map(prerequisite => (
                <li key={prerequisite}>
                  <PrerequisiteCard
                    id={prerequisite}
                    inferencer={inferencer}
                    shouldPartiallyRender={!shouldRender(prerequisite)}
                    displayModal={displayModal}
                  />
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
