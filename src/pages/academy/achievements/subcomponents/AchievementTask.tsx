import React, { useState } from 'react';

import { IconName } from '@blueprintjs/core';
import AchievementModal from './AchievementModal';
import SubAchievementCard from './SubAchievementCard';
import AchievementCard from './AchievementCard';

type AchievementTaskProps = {
  hasDropdown: boolean;
  icon: IconName;
  modalImageURL: string;
  resetModal: any;
  setModal: any;
};

function AchievementTask(props: AchievementTaskProps) {
  const { hasDropdown, icon, setModal, resetModal, modalImageURL } = props;
  const [isDropdown, setIsDropdown] = useState<boolean>(false);

  const toggleSubAchievementDropdown = () => {
    setIsDropdown(!isDropdown);
  };

  const toggelModalPopup = () => {
    setModal(<AchievementModal modalImageURL={modalImageURL} resetModal={resetModal} />);
  };

  return (
    <li>
      <AchievementCard
        hasDropdown={hasDropdown}
        icon={icon}
        isDropdown={isDropdown}
        toggleDropdown={toggleSubAchievementDropdown}
        toggleModal={toggelModalPopup}
      />
      {isDropdown ? <SubAchievementCard /> : <div></div>}
    </li>
  );
}

export default AchievementTask;
