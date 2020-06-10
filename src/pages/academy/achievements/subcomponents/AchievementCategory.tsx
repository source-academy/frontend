import React from 'react';

import { IconName, Icon } from '@blueprintjs/core';

type AchievementCategoryProps = {
  category: string;
  icon: IconName;
  count: number;
};

function AchievementCategory(props: AchievementCategoryProps) {
  const { icon, category, count } = props;
  return (
    <div>
      <div>
        <Icon color={'#ffffff'} iconSize={44} icon={icon} />
        <br />
        {category} ({count})
      </div>
    </div>
  );
}

export default AchievementCategory;
