import React, { useState } from 'react';

import SubAchievementCard from './SubAchievementCard';
import AchievementCard from './AchievementCard';
import { AchievementDetails } from '../../../../commons/achievements/AchievementTypes';

type AchievementTaskProps = {
  title: string;
  details: AchievementDetails;
  subAchievementList: any[];
  setModal: any;
};

function AchievementTask(props: AchievementTaskProps) {
  const { title, details, subAchievementList, setModal } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const toggleSubAchievementDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const displayModal = (title: string) => {
    return () => setModal(title);
  };

  return (
    <li>
      <AchievementCard
        title={title}
        details={details}
        subAchievements={subAchievementList}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleSubAchievementDropdown}
        displayModal={displayModal}
      />
      <ul>
        {isDropdownOpen
          ? subAchievementList.map(subAchievement => (
              <li>
                <div className="node">
                  <SubAchievementCard subAchievement={subAchievement} displayModal={displayModal} />
                </div>
              </li>
            ))
          : null}
      </ul>
    </li>
  );
}

export default AchievementTask;
