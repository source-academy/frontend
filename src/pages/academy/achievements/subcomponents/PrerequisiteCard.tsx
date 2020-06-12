import React from 'react';

import { Card, Icon } from '@blueprintjs/core';
import AchievementDeadline from './AchievementDeadline';
import AchievementExp from './AchievementExp';
import { AchievementItem, AchievementStatus } from '../../../../commons/achievements/AchievementTypes';
import { IconNames } from '@blueprintjs/icons';

type PrerequisiteCardProps = {
  achievement: AchievementItem;
  deadline: Date | undefined;
  isTranslucent: boolean;
  displayModal: any;
};

function PrerequisiteCard(props: PrerequisiteCardProps) {
  const { achievement, deadline, isTranslucent, displayModal } = props;
  const { title, exp, status } = achievement;

  const getIndicatorIconName = () => {
    switch(status) {
      case AchievementStatus.ACTIVE:
        return IconNames.LOCATE;
      case AchievementStatus.COMPLETED:
        return IconNames.ENDORSED;
      case AchievementStatus.EXPIRED:
        return IconNames.DELETE;
      default: 
        return IconNames.HELP;
    }
  };

  return (
    <Card
      className="prerequisite"
      style={{ opacity: isTranslucent ? '20%' : '100%' }}
      onClick={displayModal(title)}
    >

    <div className='hints'>
      <div>
      <Icon icon={getIndicatorIconName()} />
      </div>
      <div>
        {status}
      </div>
    </div>

    <div className='main'>
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
