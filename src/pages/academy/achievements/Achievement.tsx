import React, { useState } from 'react';

import { Icon, Card, Button } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';

export type DispatchProps = {};

export type StateProps = {};

function Achievement() {
  return (
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
          <AchievementCategory icon={IconNames.GLOBE} category={'ALL'} missions={22} />
          <AchievementCategory icon={IconNames.LOCATE} category={'ACTIVE'} missions={15} />
          <AchievementCategory icon={IconNames.ENDORSED} category={'COMPLETED'} missions={7} />
        </div>

        <div className="cards">
          <ul>
            <AchievementTask hasDropdown={true} icon={IconNames.PREDICTIVE_ANALYSIS} />

            <AchievementTask hasDropdown={false} icon={IconNames.PREDICTIVE_ANALYSIS} />
          </ul>
        </div>
      </div>
    </div>
  );
}

type AchievementCategoryProps = {
  icon: IconName;
  category: string;
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
};

function AchievementTask(props: AchievementTaskProps) {
  const { hasDropdown, icon } = props;
  const [isDropdown, setIsDropdown] = useState<boolean>(false);

  const toggleSubAchievementDropdown = () => {
    setIsDropdown(!isDropdown);
  };

  return (
    <li>
      <AchievementCard
        hasDropdown={hasDropdown}
        icon={icon}
        toggleDropdown={toggleSubAchievementDropdown}
      />
      {isDropdown ? <SubAchievementCard /> : <div></div>}
    </li>
  );
}

type AchievementCardProps = {
  hasDropdown: boolean;
  icon: IconName;
  toggleDropdown: any;
};

function AchievementCard(props: AchievementCardProps) {
  const { hasDropdown, icon, toggleDropdown } = props;

  return (
    <Card className="achievement">
      {hasDropdown ? (
        <div className="dropdown">
          <Button minimal={true} icon={IconNames.CARET_RIGHT} onClick={toggleDropdown} />
        </div>
      ) : (
        <div className="dropdown"></div>
      )}
      <div className="icon">
        <Icon iconSize={28} icon={icon} />
      </div>
    </Card>
  );
}

function SubAchievementCard() {
  return <Card className="subachievement"></Card>;
}

export default Achievement;
