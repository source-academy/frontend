import React from 'react';

import { Card } from '@blueprintjs/core';
import AchievementDeadline from './AchievementDeadline';
import AchievementExp from './AchievementExp';
import { AchievementItem } from '../../../../commons/achievements/AchievementTypes';

type SubAchievementCardProps = {
  achievement: AchievementItem;
  isTranslucent: boolean;
  displayModal: any;
};

function SubAchievementCard(props: SubAchievementCardProps) {
  const { achievement, isTranslucent, displayModal } = props;
  const { title, deadline, exp } = achievement;

  return (
    <Card
      className="subAchievement"
      style={{ opacity: isTranslucent ? '40%' : '100%' }}
      onClick={displayModal(title)}
    >
      <div className="display">
        <div>
          <h3>{title}</h3>
        </div>

        <div className="details">
          <div className="path">
            <p></p>
          </div>

          <AchievementDeadline deadline={deadline} />

          <AchievementExp exp={exp} />
        </div>
      </div>
    </Card>
  );
}

export default SubAchievementCard;
