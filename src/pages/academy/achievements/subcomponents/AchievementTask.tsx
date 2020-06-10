import React, { useState } from 'react';

import SubAchievementCard from './SubachievementCard';
import AchievementCard from './AchievementCard';

type AchievementTaskProps = {
  title: string;
  subachievements: any[];
  setModal: any;
};

function AchievementTask(props: AchievementTaskProps) {
  const { title, subachievements, setModal } = props;
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
        toggleDropdown={toggleSubachievementDropdown}
        displayModal={displayModal}
      />
      <ul>
        {isDropdownOpen 
          ? subachievements.map(subachievement => 
              <SubAchievementCard 
                subachievement={subachievement}
                displayModal={displayModal}
              />)
          : <div></div>}
      </ul>
      
    </li>
  );
}

export default AchievementTask;
