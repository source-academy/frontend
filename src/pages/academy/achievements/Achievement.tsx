import React, { useState } from 'react';

import { Icon, Card, Button } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';

import defaultCoverImage from '../../../assets/default_cover_image.jpg';

export type DispatchProps = {};

export type StateProps = {};

function Achievement() {
  const [achievementModal, setAchievementModal] = useState(null);

  const resetModal = () => {
    setAchievementModal(null);
  };

  return (
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
          <AchievementCategory category={'ALL'} icon={IconNames.GLOBE} missions={22} />
          <AchievementCategory category={'ACTIVE'} icon={IconNames.LOCATE} missions={15} />
          <AchievementCategory category={'COMPLETED'} icon={IconNames.ENDORSED} missions={7} />
        </div>

        <div className="cards">
          <ul>
            <AchievementTask
              hasDropdown={true}
              icon={IconNames.PREDICTIVE_ANALYSIS}
              modalImageURL={defaultCoverImage}
              resetModal={resetModal}
              setModal={setAchievementModal}
            />

            <AchievementTask
              hasDropdown={false}
              icon={IconNames.PREDICTIVE_ANALYSIS}
              modalImageURL={'http://robohash.org/set_set3/bgset_bg2/bWYZFB0dVgz'}
              resetModal={resetModal}
              setModal={setAchievementModal}
            />
          </ul>
        </div>

        {achievementModal}
      </div>
    </div>
  );
}

type AchievementCategoryProps = {
  category: string;
  icon: IconName;
  missions: number;
};

function AchievementCategory(props: AchievementCategoryProps) {
  const { icon, category, missions } = props;
  return (
    <div>
      <div>
        <Icon color={'#ffffff'} iconSize={44} icon={icon} />
        <br />
        {category} ({missions})
      </div>
    </div>
  );
}

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

type AchievementCardProps = {
  hasDropdown: boolean;
  icon: IconName;
  isDropdown: boolean;
  toggleDropdown: any;
  toggleModal: any;
};

function AchievementCard(props: AchievementCardProps) {
  const { hasDropdown, isDropdown, icon, toggleDropdown, toggleModal } = props;

  return (
    <Card className="achievement">
      {hasDropdown ? (
        <div className="dropdown">
          <Button
            icon={isDropdown ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
            minimal={true}
            onClick={toggleDropdown}
          />
        </div>
      ) : (
        <div className="dropdown"></div>
      )}
      <div className="icon">
        <Icon icon={icon} iconSize={28} onClick={toggleModal} />
      </div>
    </Card>
  );
}

function SubAchievementCard() {
  return <Card className="subachievement"></Card>;
}

type AchievementModalProps = {
  modalImageURL: string;
  resetModal: any;
};

function AchievementModal(props: AchievementModalProps) {
  const { resetModal, modalImageURL } = props;

  return (
    <div className="modal">
      <Card className="modal-container" onClick={resetModal}>
        <img src={modalImageURL} />
      </Card>
    </div>
  );
}

export default Achievement;
