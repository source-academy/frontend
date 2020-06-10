import React, { useState } from 'react';

import SubAchievementCard from './SubAchievementCard';
import AchievementCard from './AchievementCard';
import { AchievementPath } from 'src/commons/achievements/AchievementTypes';

type AchievementTaskProps = {
  title: string;
  subachievements: any[];
  setModal: any;
  path: AchievementPath;
  exp: number;
  deadline: Date | undefined;
};

function AchievementTask(props: AchievementTaskProps) {
  const { title, subachievements, setModal, path, exp, deadline } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const toggleSubachievementDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const displayModal = (title: string) => {
    return () => setModal(title);
  };

  return (
    <li>
      <AchievementCard
        title={title}
        subachievements={subachievements}
        isDropdownOpen={isDropdownOpen}
        path={path}
        exp={exp}
        deadline={deadline}
        toggleDropdown={toggleSubachievementDropdown}
        displayModal={displayModal}
      />
      <ul>
        {isDropdownOpen ? (
          subachievements.map(subachievement => (
            <SubAchievementCard subachievement={subachievement} displayModal={displayModal} />
          ))
        ) : (
          <div></div>
        )}
      </ul>
    </li>
  );
}

export default AchievementTask;
