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
import EditableAchievementModal from './editableModal/EditableAchievementModal';
import EditableAchievementAction from './editableUtils/EditableAchievementAction';
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
  inferencer: Inferencer;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement, inferencer } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { title, ability, exp, deadline, icon } = editableAchievement;

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);

  const handleSaveChanges = (achievement: AchievementItem) => {
    inferencer.editAchievement(achievement);
    setHasChanges(false);
    setPendingUpload(true);
    console.log('Saved changes!');
    console.log(achievement);
  };

  const handleDiscardChanges = () => {
    setEditableAchievement(achievement);
    setHasChanges(false);
  };

  const handleUploadChanges = () => {
    setPendingUpload(false);
    console.log('Uploading changes...');
    inferencer.logInfo();
  };

  /* Handlers to Change State of Achievement information */
  const changeTitle = (title: string) => {
    setEditableAchievement({
      ...editableAchievement,
      title: title
    });
    setHasChanges(true);
  };

  const changeExp = (exp: string) => {
    if (RegExp('[0-9]*').test(exp)) {
      setEditableAchievement({
        ...editableAchievement,
        exp: parseInt(exp)
      });
    }
    setHasChanges(true);
  };

  const changeDeadline = (deadline: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      deadline: deadline
    });
    setHasChanges(true);
  };

  const changeAbility = (ability: AchievementAbility, e: any) => {
    setEditableAchievement({
      ...editableAchievement,
      ability: ability
    });
    setHasChanges(true);
  };

  const changeThumbnail = (thumbnail: IconName) => {
    setEditableAchievement({
      ...editableAchievement,
      icon: thumbnail
    });
    setHasChanges(true);
  };

  // TODO: Delete Achievement Item
  return (
    <Card className="editable-achievement">
      <div className="top-bar">
        <EditableAchievementModal title={title} modal={achievement.modal} />
        <EditableAchievementAction
          achievement={editableAchievement}
          hasChanges={hasChanges}
          saveChanges={handleSaveChanges}
          discardChanges={handleDiscardChanges}
          pendingUpload={pendingUpload}
          uploadChanges={handleUploadChanges}
        />
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
