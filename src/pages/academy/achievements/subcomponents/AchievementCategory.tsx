import React from 'react';

import { IconName, Icon } from '@blueprintjs/core';

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

export default AchievementCategory;
