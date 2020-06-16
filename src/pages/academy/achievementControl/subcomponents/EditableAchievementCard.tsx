import React, { useState } from 'react';

import { Card, Icon, EditableText } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { AchievementItem } from '../../../../commons/achievements/AchievementTypes';
import AchievementDeadline from '../../achievements/subcomponents/utils/AchievementDeadline';
import AchievementExp from '../../achievements/subcomponents/utils/AchievementExp';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement } = props;
  const [achievementData, setAchievementData] = useState<AchievementItem>(achievement);
  const { title, ability, exp, deadline } = achievementData;

  const makeEditableTitle = () => {
    return (
      <EditableText
        placeholder={`Enter your title here`}
        value={title}
        onChange={value => {
          changeFieldTextValue(value);
        }}
      />
    );
  };

  const changeFieldTextValue = (fieldValue: string) => {
    setAchievementData({
      ...achievementData,
      title: fieldValue
    });
  };

  const changeDeadline = (deadline: Date) => {
    setAchievementData({
      ...achievementData,
      deadline: deadline
    });
  };

  return (
    <Card className="achievement">
      <div className="main">
        <div className="icon">
          <Icon icon={IconNames.PREDICTIVE_ANALYSIS} iconSize={28} />
        </div>

        <div className="display">
          <div>
            <h1>{makeEditableTitle()}</h1>
          </div>

          <div className="details">
            <div className="ability">
              <p>{ability}</p>
            </div>

            <AchievementDeadline deadline={deadline} changeDeadline={changeDeadline} />

            <AchievementExp exp={exp} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;
