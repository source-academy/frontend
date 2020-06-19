import React, { useState } from 'react';

import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import {
  AchievementItem,
  AchievementAbility,
  AchievementModalItem
} from '../../../../../commons/achievements/AchievementTypes';
import EditableAchievementTitle from './EditableAchievementTitle';
import EditableAchievementAbility from './EditableAchievementAbility';
import EditableAchievementDeadline from './EditableAchievementDeadline';
import EditableAchievementExp from './EditableAchievementExp';
import EditableAchievementModal from './EditableAchievementModal';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
  modal: AchievementModalItem;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement, modal } = props;
  const [achievementData, setAchievementData] = useState<AchievementItem>(achievement);
  const { title, ability, exp, deadline } = achievementData;

  /* Handlers to Change State of Achievement Data */
  const changeTitle = (title: string) => {
    setAchievementData({
      ...achievementData,
      title: title
    });
  };

  const changeExp = (exp: number) => {
    setAchievementData({
      ...achievementData,
      exp: exp
    });
  };

  const changeDeadline = (deadline: Date) => {
    setAchievementData({
      ...achievementData,
      deadline: deadline
    });
  };

  const changeAbility = (ability: AchievementAbility, e: any) => {
    setAchievementData({
      ...achievementData,
      ability: ability
    });
  };
  // TODO: EditableAchievementThumbnail
  // TODO: Delete Achievement Item
  return (
    <Card className="editable-achievement">
      <EditableAchievementModal modal={modal} />

      <div className="main">
        <div className="icon">
          <Icon icon={IconNames.PREDICTIVE_ANALYSIS} iconSize={28} />
        </div>

        <div className="display">
          <EditableAchievementTitle title={title} changeTitle={changeTitle} />

          <div className="details">
            <EditableAchievementAbility ability={ability} changeAbility={changeAbility} />

            <EditableAchievementDeadline deadline={deadline} changeDeadline={changeDeadline} />

            <EditableAchievementExp exp={exp} changeExp={changeExp} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;
