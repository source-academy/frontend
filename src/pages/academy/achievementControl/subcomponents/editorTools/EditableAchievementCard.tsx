import React, { useState } from 'react';

import { Card, Button } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';

import {
  AchievementItem,
  AchievementAbility
} from '../../../../../commons/achievements/AchievementTypes';
import EditableAchievementTitle from './editableUtils/EditableAchievementTitle';
import EditableAchievementAbility from './editableUtils/EditableAchievementAbility';
import EditableAchievementDeadline from './editableUtils/EditableAchievementDeadline';
import EditableAchievementExp from './editableUtils/EditableAchievementExp';
import EditableAchievementThumbnail from './editableUtils/EditableAchievementThumbnail';
import EditableAchievementModal from './editableModal/EditableAchievementModal';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
  saveChanges: any;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement, saveChanges } = props;

  const [achievementInfo, setAchievementInfo] = useState<AchievementItem>(achievement);
  const { title, ability, exp, deadline, icon } = achievementInfo;

  /* Handlers to Change State of Achievement information */
  const changeTitle = (title: string) => {
    setAchievementInfo({
      ...achievementInfo,
      title: title
    });
  };

  const changeExp = (exp: string) => {
    if (RegExp('[0-9]*').test(exp)) {
      setAchievementInfo({
        ...achievementInfo,
        exp: parseInt(exp)
      });
    }
  };

  const changeDeadline = (deadline: Date) => {
    setAchievementInfo({
      ...achievementInfo,
      deadline: deadline
    });
  };

  const changeAbility = (ability: AchievementAbility, e: any) => {
    setAchievementInfo({
      ...achievementInfo,
      ability: ability
    });
  };

  const changeThumbnail = (thumbnail: IconName) => {
    setAchievementInfo({
      ...achievementInfo,
      icon: thumbnail
    });
  };

  // TODO: Delete Achievement Item
  return (
    <Card className="editable-achievement">
      <div className="top-bar">
        <EditableAchievementModal title={title} modal={achievement.modal} />
        <Button icon={'export'} intent={'danger'} outlined={true} onClick={saveChanges} />
      </div>

      <div className="main">
        <EditableAchievementThumbnail thumbnail={icon} changeThumbnail={changeThumbnail} />

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
