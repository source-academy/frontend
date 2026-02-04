import { Collapse } from '@blueprintjs/core';
import React, { useContext, useState } from 'react';

import {
  AchievementContext,
  getAbilityColor
} from '../../features/achievement/AchievementConstants';
import { AchievementStatus, FilterStatus } from '../../features/achievement/AchievementTypes';
import AchievementCard from './AchievementCard';

type Props = {
  uuid: string;
  filterStatus: FilterStatus;
  focusState: [string, any];
};

const AchievementTask: React.FC<Props> = ({ uuid, filterStatus, focusState }) => {
  const inferencer = useContext(AchievementContext);
  const prerequisiteUuids = [...inferencer.getImmediateChildren(uuid)];
  const taskColor = getAbilityColor();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  /**
   * Checks whether the AchievementItem (can be a task or prereq) should be rendered
   * based on the achievement dashboard filterStatus.
   */
  const isInFilter = (uuid: string): boolean => {
    const status = inferencer.getStatus(uuid);

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
   * Checks whether the AchievementItem (can be a task or prereq) should be rendered
   * based on the achievement dashboard filterStatus and whether it is a prereq.
   */
  const shouldRender = (uuid: string): boolean => {
    const isPrerequisite = inferencer.isPrerequisite(uuid);

    return !isPrerequisite && isInFilter(uuid);
  };

  /**
   * Checks whether the AchievementItem has any prerequisite that
   * should be rendered based on the achievement dashboard filterStatus.
   *
   * If there is at least 1 prerequisite that needs to be rendered,
   * the whole AchievementTask will be rendered together.
   */
  const shouldRenderPrerequisites = (uuid: string) => {
    const children = [...inferencer.getImmediateChildren(uuid)];
    return children.reduce((canRender, prerequisite) => {
      return canRender || isInFilter(prerequisite);
    }, false);
  };

  /**
   * If the main achievement or any of the prerequisites need to be rendered,
   * the whole achievement task will be rendered
   */
  const shouldRenderTask = (uuid: string) => shouldRender(uuid) || shouldRenderPrerequisites(uuid);

  return (
    <>
      {shouldRenderTask(uuid) && (
        <li className="task">
          <AchievementCard
            uuid={uuid}
            focusState={focusState}
            isDropdownOpen={isDropdownOpen}
            shouldRender={isInFilter(uuid)}
            toggleDropdown={toggleDropdown}
          />
          <Collapse isOpen={isDropdownOpen} keepChildrenMounted={true}>
            <div className="prerequisite-container">
              {prerequisiteUuids.map(prerequisiteUuid => (
                <div className="prerequisite" key={prerequisiteUuid}>
                  <div
                    className="dropdown-lines"
                    style={{
                      borderBottom: `1px solid ${taskColor}`,
                      borderLeft: `1px solid ${taskColor}`
                    }}
                  ></div>
                  <AchievementCard
                    uuid={prerequisiteUuid}
                    focusState={focusState}
                    shouldRender={isInFilter(prerequisiteUuid)}
                  />
                </div>
              ))}
            </div>
          </Collapse>
        </li>
      )}
    </>
  );
};

export default AchievementTask;
