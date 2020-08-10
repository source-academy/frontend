import { Card } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';

import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../../features/achievement/AchievementTypes';
import AchievementInferencer from '../../utils/AchievementInferencer';
import AchievementDeleter from './editableUtils/AchievementDeleter';
import AchievementUploader from './editableUtils/AchievementUploader';
import EditableAchievementAbility from './editableUtils/EditableAchievementAbility';
import EditableAchievementBackground from './editableUtils/EditableAchievementBackground';
import EditableAchievementDate from './editableUtils/EditableAchievementDate';
import EditableAchievementTitle from './editableUtils/EditableAchievementTitle';
import EditableAchievementView from './editableView/EditableAchievementView';

type EditableAchievementCardProps = {
  id: number;
  inferencer: AchievementInferencer;
  forceRender: () => void;
  releaseId: (id: number) => void;
  requestPublish: () => void;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { id, inferencer, forceRender, releaseId, requestPublish } = props;

  const achievementReference = inferencer.getAchievementItem(id);

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(
    () => cloneDeep(achievementReference) // Expensive, only clone once on initialization
  );
  const resetEditableAchievement = () => setEditableAchievement(cloneDeep(achievementReference));
  const {
    ability,
    cardTileUrl,
    deadline,
    /*
    goalIds,
    isTask,
    position,
    prerequisiteIds,
    */
    release,
    title,
    view
  } = editableAchievement;

  const [isDirty, setIsDirty] = useState<boolean>(false);

  // TODO: Replace the following 3 useState with useReducer for state management & cleanup
  const handleSaveChanges = () => {
    inferencer.modifyAchievement(editableAchievement);
    setIsDirty(false);
    releaseId(id);
    requestPublish();
    forceRender();
  };

  const handleDiscardChanges = () => {
    resetEditableAchievement();
    setIsDirty(false);
  };

  const handleDeleteAchievement = () => {
    inferencer.removeAchievement(id);
    setIsDirty(false);
    releaseId(id);
    requestPublish();
    forceRender();
  };

  // TODO: Replace all of the following useState with useReducer for editable content
  const handleChangeTitle = (title: string) => {
    setEditableAchievement({
      ...editableAchievement,
      title: title
    });
    setIsDirty(true);
  };

  const handleChangeBackground = (cardTileUrl: string) => {
    setEditableAchievement({
      ...editableAchievement,
      cardTileUrl: cardTileUrl
    });
    setIsDirty(true);
  };

  const handleChangeRelease = (release: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      release: release
    });
    setIsDirty(true);
  };

  const handleChangeDeadline = (deadline: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      deadline: deadline
    });
    setIsDirty(true);
  };

  const handleChangeAbility = (ability: AchievementAbility) => {
    setEditableAchievement({
      ...editableAchievement,
      ability: ability
    });
    setIsDirty(true);
  };

  const handleChangeView = (view: AchievementView) => {
    setEditableAchievement({
      ...editableAchievement,
      view: view
    });
    setIsDirty(true);
  };

  return (
    <Card
      className="editable-achievement"
      style={{
        background: `url(${cardTileUrl}) center/cover`
      }}
    >
      <div className="top-bar">
        <EditableAchievementView title={title} view={view} changeView={handleChangeView} />

        <AchievementUploader
          hasChanges={isDirty}
          saveChanges={handleSaveChanges}
          discardChanges={handleDiscardChanges}
        />
      </div>

      <div className="main">
        <EditableAchievementBackground
          cardTileUrl={cardTileUrl}
          setcardTileUrl={handleChangeBackground}
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
