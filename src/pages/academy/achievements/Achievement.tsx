import React from 'react';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

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
      </div>
    </div>
  );
}

type AchievementCategoryProps = {
  icon: any;
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

export default Achievement;
