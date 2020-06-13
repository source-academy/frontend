import React from 'react';

import { Card } from '@blueprintjs/core';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import AchievementHints from '../utils/AchievementHints';

type PrerequisiteCardProps = {
  achievement: AchievementItem;
  exp: number | undefined;
  deadline: Date | undefined;
  isTranslucent: boolean;
  displayModal: any;
};

function PrerequisiteCard(props: PrerequisiteCardProps) {
  const { achievement, exp, deadline, isTranslucent, displayModal } = props;
  const { id, title, status } = achievement;

  return (
    <Card
      className="prerequisite"
      style={{ opacity: isTranslucent ? '20%' : '100%' }}
      onClick={displayModal(id)}
    >
      <AchievementHints status={status} />

      <div className="main">
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
      </div>
    </Card>
  );
}

export default PrerequisiteCard;
