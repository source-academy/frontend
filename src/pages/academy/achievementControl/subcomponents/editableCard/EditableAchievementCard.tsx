import React, { useState } from 'react';

import { Card } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';

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
import EditableAchievementThumbnail from './EditableAchievementThumbnail';

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

  const changeExp = (exp: string) => {
    if (RegExp('[0-9]*').test(exp)) {
      setAchievementData({
        ...achievementData,
        exp: parseInt(exp)
      });
    }
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

  // TODO: Implement Achievement Thumbnail (not urgent)
  const changeThumbnail = (thumbnail: IconName) => {
    console.log('changeThumbnail not implemented');
  };

  // TODO: Delete Achievement Item
  return (
    <Card className="editable-achievement">
      <EditableAchievementModal modal={modal} />

      <div className="main">
        <EditableAchievementThumbnail
          thumbnail={IconNames.PREDICTIVE_ANALYSIS}
          changeThumbnail={changeThumbnail}
        />

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
