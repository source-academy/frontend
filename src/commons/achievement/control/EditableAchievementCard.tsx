import { cloneDeep } from 'lodash';
import React, { useContext, useState } from 'react';

import { AchievementContext } from '../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../features/achievement/AchievementTypes';
import AchievementDeleter from './achievementEditor/AchievementDeleter';
import AchievementSaver from './achievementEditor/AchievementSaver';
import EditableAbility from './achievementEditor/EditableAbility';
import EditableDate from './achievementEditor/EditableDate';
import EditableOptions from './achievementEditor/EditableOptions';
import EditableTitle from './achievementEditor/EditableTitle';
import EditableView from './achievementEditor/EditableView';

type EditableAchievementCardProps = {
  id: number;
  forceRender: () => void;
  releaseId: (id: number) => void;
  requestPublish: () => void;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { id, forceRender, releaseId, requestPublish } = props;

  const inferencer = useContext(AchievementContext);
  const achievementReference = inferencer.getAchievementItem(id);

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(
    () => cloneDeep(achievementReference) // Expensive, only clone once on initialization
  );
  const resetEditableAchievement = () => setEditableAchievement(cloneDeep(achievementReference));
  const {
    ability,
    cardTileUrl,
    deadline,
    goalIds,
    position,
    prerequisiteIds,
    release,
    title,
    view
  } = editableAchievement;

  // A save/discard button appears on top of the card when it's dirty
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
  const handleChangeAbility = (ability: AchievementAbility) => {
    setEditableAchievement({
      ...editableAchievement,
      ability: ability
    });
    setIsDirty(true);
  };

  const handleChangeCardBackground = (cardTileUrl: string) => {
    setEditableAchievement({
      ...editableAchievement,
      cardTileUrl: cardTileUrl
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

  const handleChangeRelease = (release: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      release: release
    });
    setIsDirty(true);
  };

  const handleChangeTitle = (title: string) => {
    setEditableAchievement({
      ...editableAchievement,
      title: title
    });
    setIsDirty(true);
  };

  const handleChangePosition = (position: number) => {
    const isTask = position !== 0;
    setEditableAchievement({
      ...editableAchievement,
      isTask: isTask,
      position: position
    });
    setIsDirty(true);
  };

  const handleChangePrerequisiteIds = (prerequisiteIds: number[]) => {
    setEditableAchievement({
      ...editableAchievement,
      prerequisiteIds: prerequisiteIds
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
    <div
      className="editable-card"
      style={{
        background: `url(${cardTileUrl}) center/cover`
      }}
    >
      <div className="action-button">
        <EditableView view={view} changeView={handleChangeView} />
        <EditableOptions
          id={id}
          cardBackground={cardTileUrl}
          changeCardBackground={handleChangeCardBackground}
          changePosition={handleChangePosition}
          changePrerequisiteIds={handleChangePrerequisiteIds}
          goalIds={goalIds}
          position={position}
          prerequisiteIds={prerequisiteIds}
        />
      </div>

      <div className="content">
        <div className="heading">
          <EditableTitle title={title} changeTitle={handleChangeTitle} />
          <div className="status">
            {isDirty ? (
              <AchievementSaver
                discardChanges={handleDiscardChanges}
                saveChanges={handleSaveChanges}
              />
            ) : (
              <AchievementDeleter deleteAchievement={handleDeleteAchievement} />
            )}
          </div>

          <div className="details">
            <EditableAbility ability={ability} changeAbility={handleChangeAbility} />

            <EditableDate type="Release" date={deadline} changeDate={handleChangeDeadline} />

            <EditableDate type="Deadline" date={release} changeDate={handleChangeRelease} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditableAchievementCard;
