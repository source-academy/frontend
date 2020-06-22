import React, { useState } from 'react';

import { Card } from '@blueprintjs/core';
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
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';
import EditableAchievementModal from './editableModal/EditableAchievementModal';

type EditableAchievementCardProps = {
  id: number;
  inferencer: Inferencer;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { id, inferencer } = props;
  const achievement = inferencer.getAchievementItem(id);

  const { title, ability, exp, deadline, icon, modal } = achievement;
  const [content, setContent] = useState<AchievementItem>(achievement);

  /* Handlers to Change State of Achievement Data */
  const changeTitle = (title: string) => {
    setContent({
      ...content,
      title: title
    });
  };

  const changeExp = (exp: string) => {
    if (RegExp('[0-9]*').test(exp)) {
      setContent({
        ...content,
        exp: parseInt(exp)
      });
    }
  };

  const changeDeadline = (deadline: Date) => {
    setContent({
      ...content,
      deadline: deadline
    });
  };

  const changeAbility = (ability: AchievementAbility, e: any) => {
    setContent({
      ...content,
      ability: ability
    });
  };

  const changeThumbnail = (thumbnail: IconName) => {
    setContent({
      ...content,
      icon: thumbnail
    });
  };

  // TODO: Delete Achievement Item
  return (
    <Card className="editable-achievement">
      <EditableAchievementModal title={title} modal={modal} />

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
