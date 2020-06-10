import React from 'react';

import { Card } from '@blueprintjs/core';
import AchievementDeadline from './AchievementDeadline';
import AchievementExp from './AchievementExp';

type SubAchievementCardProps = {
  subAchievement: any;
  displayModal: any;
};

function SubAchievementCard(props: SubAchievementCardProps) {
  const { subAchievement, displayModal } = props;
  const [{ title, deadline, exp }] = subAchievement;

  return (
    <Card className="subAchievement" onClick={displayModal(title)}>
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
