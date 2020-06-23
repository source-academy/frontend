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
    setPendingUpload(false);
  };

  const handleUploadChanges = () => {
    setPendingUpload(false);
    console.log('Uploading changes...');
    inferencer.logInfo();
  };

  /* Handlers to Change State of Achievement information */
  const handleChangeTitle = (title: string) => {
    setEditableAchievement({
      ...editableAchievement,
      title: title
    });
    setHasChanges(true);
  };

  const handleChangeExp = (exp: string) => {
    if (RegExp('[0-9]*').test(exp)) {
      if (exp === '') {
        exp = '0'; // handle special case of empty input
      }
      setEditableAchievement({
        ...editableAchievement,
        exp: parseInt(exp)
      });
    }
    setHasChanges(true);
  };

  const handleChangeDeadline = (deadline: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      deadline: deadline
    });
    setHasChanges(true);
  };

  const handleChangeAbility = (ability: AchievementAbility, e: any) => {
    setEditableAchievement({
      ...editableAchievement,
      ability: ability
    });
    setHasChanges(true);
  };

  const handleChangeThumbnail = (thumbnail: IconName) => {
    setEditableAchievement({
      ...editableAchievement,
      icon: thumbnail
    });
    setHasChanges(true);
  };

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
        <EditableAchievementThumbnail thumbnail={icon} changeThumbnail={handleChangeThumbnail} />

        <div className="display">
          <EditableAchievementTitle title={title} changeTitle={handleChangeTitle} />

          <div className="details">
            <EditableAchievementAbility ability={ability} changeAbility={handleChangeAbility} />

            <EditableAchievementDeadline
              deadline={deadline}
              changeDeadline={handleChangeDeadline}
            />

            <EditableAchievementExp exp={exp} changeExp={handleChangeExp} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;
