import React, { useState } from 'react';

import SubAchievementCard from './SubAchievementCard';
import AchievementCard from './AchievementCard';
import { AchievementAbility } from 'src/commons/achievements/AchievementTypes';

type AchievementTaskProps = {
  title: string;
  subachievements: any[];
  setModal: any;
  ability: AchievementAbility;
  exp: number;
  deadline: Date | undefined;
};

function AchievementTask(props: AchievementTaskProps) {
  const { title, subachievements, setModal, ability, exp, deadline } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const toggleSubachievementDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const displayModal = (title: string) => {
    return () => setModal(title);
  };

  return (
    <li key={title}>
      <AchievementCard
        title={title}
        subachievements={subachievements}
        isDropdownOpen={isDropdownOpen}
        ability={ability}
        exp={exp}
        deadline={deadline}
        toggleDropdown={toggleSubachievementDropdown}
        displayModal={displayModal}
      />
      <ul>
        {isDropdownOpen ? (
          subachievements.map(subachievement => (
            <div className="node">
              <SubAchievementCard subachievement={subachievement} displayModal={displayModal} />
            </div>
          ))
        ) : (
          <div></div>
        )}
      </ul>
    </li>
  );
}

export default AchievementTask;
