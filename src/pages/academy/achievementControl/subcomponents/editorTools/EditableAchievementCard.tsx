import React, { useState } from 'react';

import { Card } from '@blueprintjs/core';

import {
  AchievementItem,
  AchievementAbility,
  AchievementModalItem
} from '../../../../../commons/achievements/AchievementTypes';
import EditableAchievementTitle from './editableUtils/EditableAchievementTitle';
import EditableAchievementAbility from './editableUtils/EditableAchievementAbility';
import EditableAchievementDate from './editableUtils/EditableAchievementDate';
import EditableAchievementExp from './editableUtils/EditableAchievementExp';
import EditableAchievementModal from './editableModal/EditableAchievementModal';
import AchievementUploader from './editableUtils/AchievementUploader';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';
import AchievementDeleter from './editableUtils/AchievementDeleter';
import EditableAchievementBackground from './editableUtils/EditableAchievementBackground';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
  forceRender: any;
  adderId: number;
  setAdderId: any;
  addUnsavedChange: any;
  removeUnsavedChange: any;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const {
    achievement,
    inferencer,
    updateAchievements,
    editAchievement,
    forceRender,
    adderId,
    setAdderId,
    addUnsavedChange,
    removeUnsavedChange
  } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id, title, ability, exp, deadline, backgroundImageUrl, release } = editableAchievement;

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);

  const setUnsaved = () => {
    if (!hasChanges) {
      setHasChanges(true);
      addUnsavedChange();
    }
  };

  const setUpload = () => {
    setPendingUpload(false);
    removeUnsavedChange();
  };

  const handleSaveChanges = () => {
    inferencer.modifyAchievement(editableAchievement);
    setHasChanges(false);
    setPendingUpload(true);

    if (id === adderId) {
      setAdderId(-1);
    }

    forceRender();
  };

  const handleUploadChanges = () => {
    editAchievement(editableAchievement);
    setUpload();
  };

  const handleDeleteAchievement = () => {
    inferencer.removeAchievement(id);
    updateAchievements();

    if (id === adderId) {
      setAdderId(-1);
    }
  };

  const handleDiscardChanges = () => {
    setEditableAchievement(achievement);
    setHasChanges(false);
    setUpload();
  };

  const handleChangeTitle = (title: string) => {
    setEditableAchievement({
      ...editableAchievement,
      title: title
    });
    setUnsaved();
  };

  const handleChangeExp = (exp: string) => {
    if (RegExp('[0-9]*').test(exp)) {
      if (exp === '') {
        exp = '0';
      }
      setEditableAchievement({
        ...editableAchievement,
        exp: parseInt(exp)
      });
      setUnsaved();
    }
  };

  const handleChangeBackground = (backgroundImageUrl: string) => {
    setEditableAchievement({
      ...editableAchievement,
      backgroundImageUrl: backgroundImageUrl
    });
    setUnsaved();
  };

  const handleChangeRelease = (release: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      release: release
    });
    setUnsaved();
  };

  const handleChangeDeadline = (deadline: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      deadline: deadline
    });
    setUnsaved();
  };

  const handleChangeAbility = (ability: AchievementAbility, e: any) => {
    setEditableAchievement({
      ...editableAchievement,
      ability: ability
    });
    setUnsaved();
  };

  const handleChangeModal = (modal: AchievementModalItem) => {
    setEditableAchievement({
      ...editableAchievement,
      modal: modal
    });
    setUnsaved();
  };

  return (
    <Card
      className="editable-achievement"
      style={{
        background: `url(${backgroundImageUrl})`
      }}
    >
      <div className="top-bar">
        <EditableAchievementModal
          title={title}
          modal={achievement.modal}
          changeModal={handleChangeModal}
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
        <EditableAchievementBackground
          backgroundImageUrl={backgroundImageUrl}
          setBackgroundImageUrl={handleChangeBackground}
        />
        <div className="display">
          <EditableAchievementTitle title={title} changeTitle={handleChangeTitle} />

          <div className="details">
            <EditableAchievementAbility ability={ability} changeAbility={handleChangeAbility} />

            <EditableAchievementDate
              type="Deadline"
              deadline={deadline}
              changeDeadline={handleChangeDeadline}
            />

            <EditableAchievementDate
              type="Release"
              deadline={release}
              changeDeadline={handleChangeRelease}
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
