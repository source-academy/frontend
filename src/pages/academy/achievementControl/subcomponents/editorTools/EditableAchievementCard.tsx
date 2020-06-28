import React, { useState } from 'react';

import { Card } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';

import {
  AchievementItem,
  AchievementAbility,
  AchievementModalItem
} from '../../../../../commons/achievements/AchievementTypes';
import EditableAchievementTitle from './editableUtils/EditableAchievementTitle';
import EditableAchievementAbility from './editableUtils/EditableAchievementAbility';
import EditableAchievementDeadline from './editableUtils/EditableAchievementDeadline';
import EditableAchievementExp from './editableUtils/EditableAchievementExp';
import EditableAchievementThumbnail from './editableUtils/EditableAchievementThumbnail';
import EditableAchievementModal from './editableModal/EditableAchievementModal';
import AchievementUploader from './editableUtils/AchievementUploader';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';
import AchievementDeleter from './editableUtils/AchievementDeleter';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
  inferencer: Inferencer;
  handleAchievementsUpdate: any;
  uploadAchievementData: any;
  forceRefresh: any;
  editAchievement: any;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement, inferencer, uploadAchievementData, forceRefresh } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id, title, ability, exp, deadline, icon } = editableAchievement;

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);

  const handleSaveChanges = () => {
    inferencer.editAchievement(editableAchievement);
    setHasChanges(false);
    setPendingUpload(true);
    forceRefresh();
  };

  const handleUploadChanges = () => {
    uploadAchievementData(inferencer.getAchievementData());
    setPendingUpload(false);
  };

  const handleDeleteAchievement = () => {
    inferencer.removeAchievement(id);
    uploadAchievementData(inferencer.getAchievementData());
  };

  const handleDiscardChanges = () => {
    setEditableAchievement(achievement);
    setHasChanges(false);
    setPendingUpload(false);
  };

  ///////////////////////// TODO: IMPLEMENT THIS //////////////////////////////

  /*
  const handleDeleteAchievement = () => {
    const achievement = inferencer.getAchievementItem(id);
    inferencer.removeAchievement(id);
    handleAchievementsUpdate(achievement);
    forceRefresh();
  }

  const handleSaveChanges = () => {
    inferencer.editAchievement(editableAchievement);
    setHasChanges(false);
    setPendingUpload(true);
    forceRefresh();
  }

  const handleUploadChanges = () => {
    editAchievement(editableAchievement);
    setPendingUpload(false);
    forceRefresh();
  }
  */

  ///////////////////////// TODO: IMPLEMENT THIS //////////////////////////////

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

  const handleChangeModal = (modal: AchievementModalItem) => {
    setEditableAchievement({
      ...editableAchievement,
      modal: modal
    });
    setHasChanges(true);
  };

  return (
    <Card className="editable-achievement">
      <div className="top-bar">
        <EditableAchievementModal
          title={title}
          modal={achievement.modal}
          handleChangeModal={handleChangeModal}
        />
        <AchievementUploader
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
          <AchievementDeleter deleteAchievement={handleDeleteAchievement} />
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;
