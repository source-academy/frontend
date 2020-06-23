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
import SaveAchievementButton from './editableUtils/SaveAchievementButton';
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';
import DeleteAchievementButton from './editableUtils/DeleteAchievementButton';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
  inferencer: Inferencer;
  forceUpdate: any;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement, inferencer, forceUpdate } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id, title, ability, exp, deadline, icon } = editableAchievement;

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);

  const handleSaveChanges = () => {
    inferencer.editAchievements(editableAchievement);
    setHasChanges(false);
    setPendingUpload(true);
    console.log('Saved changes!', editableAchievement);
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

  const handleDeleteAchievement = () => {
    console.log('Deleted achievement', inferencer.getAchievementItem(id));
    inferencer.removeAchievement(id);
    forceUpdate();
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
      setHasChanges(true);
    }
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
        <SaveAchievementButton
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
        <div className="details">
          <DeleteAchievementButton deleteAchievement={handleDeleteAchievement} />
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;
