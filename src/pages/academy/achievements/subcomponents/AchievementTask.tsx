import React, { useState } from 'react';

import SubAchievementCard from './SubAchievementCard';
import AchievementCard from './AchievementCard';
import { AchievementAbility } from 'src/commons/achievements/AchievementTypes';

type AchievementTaskProps = {
  title: string;
  subAchievement: any[];
  setModal: any;
  ability: AchievementAbility;
  exp: number;
  deadline: Date | undefined;
};

function AchievementTask(props: AchievementTaskProps) {
  const { title, subAchievement, setModal, ability, exp, deadline } = props;
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
        subAchievements={subAchievement}
        isDropdownOpen={isDropdownOpen}
        ability={ability}
        exp={exp}
        deadline={deadline}
        toggleDropdown={toggleSubAchievementDropdown}
        displayModal={displayModal}
      />
      <ul>
        {isDropdownOpen
          ? subAchievement.map(subAchievement => (
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
