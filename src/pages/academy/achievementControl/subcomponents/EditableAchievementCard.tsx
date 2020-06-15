import React from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { Card, Icon } from '@blueprintjs/core';
import AchievementDeadline from '../../achievements/subcomponents/utils/AchievementDeadline';
import { IconNames } from '@blueprintjs/icons';
import AchievementExp from '../../achievements/subcomponents/utils/AchievementExp';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement } = props;
  const { title, ability, exp, deadline } = achievement;

  return (
    <Card className="achievement">
      <div className="main">
        <div className="icon">
          <Icon icon={IconNames.PREDICTIVE_ANALYSIS} iconSize={28} />
        </div>

        <div className="display">
          <div>
            <h1>{title}</h1>
          </div>

          <div className="details">
            <div className="ability">
              <p>{ability}</p>
            </div>

            <AchievementDeadline deadline={deadline} />

            <AchievementExp exp={exp} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;
