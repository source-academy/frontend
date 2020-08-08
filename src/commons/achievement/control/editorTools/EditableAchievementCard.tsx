import { Card } from '@blueprintjs/core';
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
  controlState: [number, any];
  publishState: [boolean, any];
  forceRender: () => void;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { id, inferencer, controlState, publishState, forceRender } = props;

  const [controlId, setControlId] = controlState;
  const [, setCanPublish] = publishState;

  const achievement = inferencer.getAchievementItem(id);
  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const {
    title,
    ability,
    deadline,
    release,
    /* TODO:
    isTask,
    position,
    prerequisiteIds,
    goalIds, */
    cardTileUrl,
    view
  } = editableAchievement;

  const [isDirty, setIsDirty] = useState<boolean>(false);

  const handleSaveChanges = () => {
    inferencer.modifyAchievement(editableAchievement);
    setIsDirty(false);
    setCanPublish(true);
    forceRender();
    /**
     * It means that there is currently an item being added.
     * Once this item is added, we can reset it to -1, which means
     * that there is no achievement being added.
     * indicating to the system that there is no achievement
     * being added.
     */
    if (id === controlId) {
      setControlId(-1);
    }
  };

  const handleDiscardChanges = () => {
    setEditableAchievement(achievement);
    setIsDirty(false);
  };

  const handleDeleteAchievement = () => {
    inferencer.removeAchievement(id);
    setCanPublish(true);
    forceRender();

    if (id === controlId) {
      setControlId(-1);
    }
  };

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
