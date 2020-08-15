import { EditableText } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useContext, useState } from 'react';

import { AchievementContext } from '../../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../../features/achievement/AchievementTypes';
import ItemDeleter from '../common/ItemDeleter';
import ItemSaver from '../common/ItemSaver';
import AchievementSettings from './AchievementSettings';
import EditableAbility from './EditableAbility';
import EditableDate from './EditableDate';
import EditableView from './EditableView';

type EditableCardProps = {
  id: number;
  releaseId: (id: number) => void;
  requestPublish: () => void;
};

function EditableCard(props: EditableCardProps) {
  const { id, releaseId, requestPublish } = props;

  const inferencer = useContext(AchievementContext);
  const achievementReference = inferencer.getAchievement(id);

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

  const handleChangeGoalIds = (goalIds: number[]) => {
    setEditableAchievement({
      ...editableAchievement,
      goalIds: goalIds
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

  const handleChangeView = (view: AchievementView) => {
    setEditableAchievement({
      ...editableAchievement,
      view: view
    });
    setIsDirty(true);
  };

  return (
    <li
      className="editable-card"
      style={{
        background: `url(${cardTileUrl}) center/cover`
      }}
    >
      <div className="action-button">
        {isDirty ? (
          <ItemSaver discardChanges={handleDiscardChanges} saveChanges={handleSaveChanges} />
        ) : (
          <ItemDeleter deleteItem={handleDeleteAchievement} />
        )}
      </div>

      <div className="content">
        <h3 className="title">
          <EditableText
            placeholder="Enter your title here"
            value={title}
            onChange={handleChangeTitle}
          />
        </h3>
        <div className="details">
          <EditableAbility ability={ability} changeAbility={handleChangeAbility} />
          <EditableDate type="Release" date={release} changeDate={handleChangeRelease} />
          <EditableDate type="Deadline" date={deadline} changeDate={handleChangeDeadline} />
        </div>
      </div>

      <div className="content-button">
        <EditableView view={view} changeView={handleChangeView} />
        <AchievementSettings
          id={id}
          cardBackground={cardTileUrl}
          changeCardBackground={handleChangeCardBackground}
          changeGoalIds={handleChangeGoalIds}
          changePosition={handleChangePosition}
          changePrerequisiteIds={handleChangePrerequisiteIds}
          goalIds={goalIds}
          position={position}
          prerequisiteIds={prerequisiteIds}
        />
      </div>
    </li>
  );
}

export default EditableCard;
