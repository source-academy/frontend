import { EditableText } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useContext, useMemo, useReducer } from 'react';

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

const reducer = (
  state: { editableAchievement: AchievementItem; isDirty: boolean },
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case 'SAVE_CHANGES':
      return {
        ...state,
        isDirty: false
      };
    case 'DISCARD_CHANGES':
      return {
        editableAchievement: action.payload,
        isDirty: false
      };
    case 'DELETE_ACHIEVEMENT':
      return {
        ...state,
        isDirty: false
      };
    case 'CHANGE_ABILITY':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          ability: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_CARD_BACKGROUND':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          cardBackground: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_DEADLINE':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          deadline: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_GOAL_IDS':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          goalIds: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_POSITION':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          isTask: action.payload !== 0,
          position: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_PREREQUISITE_IDS':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          prerequisiteIds: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_RELEASE':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          release: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_TITLE':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          title: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_VIEW':
      return {
        editableAchievement: {
          ...state.editableAchievement,
          view: action.payload
        },
        isDirty: true
      };
    default:
      return state;
  }
};

const initialState = {
  editableAchievement: {} as AchievementItem,
  isDirty: false
};

function EditableCard(props: EditableCardProps) {
  const { id, releaseId, requestPublish } = props;

  const inferencer = useContext(AchievementContext);
  const achievement = inferencer.getAchievement(id);
  const achievementClone = useMemo(() => cloneDeep(achievement), [achievement]);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    editableAchievement: achievementClone
  });
  const { editableAchievement, isDirty } = state;
  const {
    ability,
    cardBackground,
    deadline,
    goalIds,
    position,
    prerequisiteIds,
    release,
    title,
    view
  } = editableAchievement;

  const handleDiscardChanges = () =>
    dispatch({ type: 'DISCARD_CHANGES', payload: achievementClone });

  const handleSaveChanges = () => {
    dispatch({ type: 'SAVE_CHANGES' });
    inferencer.modifyAchievement(editableAchievement);
    releaseId(id);
    requestPublish();
  };

  const handleDeleteAchievement = () => {
    dispatch({ type: 'DELETE_ACHIEVEMENT' });
    inferencer.removeAchievement(id);
    releaseId(id);
    requestPublish();
  };

  const handleChangeAbility = (ability: AchievementAbility) =>
    dispatch({ type: 'CHANGE_ABILITY', payload: ability });

  const handleChangeCardBackground = (cardBackground: string) =>
    dispatch({ type: 'CHANGE_CARD_BACKGROUND', payload: cardBackground });

  const handleChangeDeadline = (deadline?: Date) =>
    dispatch({ type: 'CHANGE_DEADLINE', payload: deadline });

  const handleChangeGoalIds = (goalIds: number[]) =>
    dispatch({ type: 'CHANGE_GOAL_IDS', payload: goalIds });

  const handleChangePosition = (position: number) =>
    dispatch({ type: 'CHANGE_POSITION', payload: position });

  const handleChangePrerequisiteIds = (prerequisiteIds: number[]) =>
    dispatch({ type: 'CHANGE_PREREQUISITE_IDS', payload: prerequisiteIds });

  const handleChangeRelease = (release?: Date) =>
    dispatch({ type: 'CHANGE_RELEASE', payload: release });

  const handleChangeTitle = (title: string) => dispatch({ type: 'CHANGE_TITLE', payload: title });

  const handleChangeView = (view: AchievementView) =>
    dispatch({ type: 'CHANGE_VIEW', payload: view });

  return (
    <li
      className="editable-card"
      style={{
        background: `url(${cardBackground}) center/cover`
      }}
    >
      <div className="action-button">
        {isDirty ? (
          <ItemSaver discardChanges={handleDiscardChanges} saveChanges={handleSaveChanges} />
        ) : (
          <ItemDeleter handleDelete={handleDeleteAchievement} item={title} />
        )}
      </div>

      <div className="content">
        <h3 className="title">
          <EditableText
            onChange={handleChangeTitle}
            placeholder="Enter your title here"
            value={title}
          />
        </h3>
        <div className="details">
          <EditableAbility ability={ability} changeAbility={handleChangeAbility} />
          <EditableDate changeDate={handleChangeRelease} date={release} type="Release" />
          <EditableDate changeDate={handleChangeDeadline} date={deadline} type="Deadline" />
        </div>
      </div>

      <div className="content-button">
        <EditableView changeView={handleChangeView} view={view} />
        <AchievementSettings
          id={id}
          cardBackground={cardBackground}
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
