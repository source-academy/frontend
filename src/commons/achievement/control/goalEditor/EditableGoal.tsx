import { EditableText } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useContext, useMemo, useReducer, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { GoalDefinition, GoalMeta } from 'src/features/achievement/AchievementTypes';

import ItemDeleter from '../common/ItemDeleter';
import ItemSaver from '../common/ItemSaver';
import {
  EditableGoalAction as Action,
  EditableGoalActionType as ActionType,
  EditableGoalState as State
} from './EditableGoalTypes';
import EditableMeta from './EditableMeta';

const init = (goal: GoalDefinition): State => {
  return {
    editableGoal: goal,
    isDirty: false
  };
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.SAVE_CHANGES:
      return {
        ...state,
        isDirty: false
      };
    case ActionType.DISCARD_CHANGES:
      return init(action.payload);
    case ActionType.DELETE_GOAL:
      return {
        ...state,
        isDirty: false
      };
    case ActionType.CHANGE_META:
      return {
        editableGoal: {
          ...state.editableGoal,
          meta: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_TEXT:
      return {
        editableGoal: {
          ...state.editableGoal,
          text: action.payload
        },
        isDirty: true
      };
    default:
      return state;
  }
};

type Props = {
  uuid: string;
  isNewGoal: boolean;
  releaseUuid: () => void;
  removeCard: (uuid: string) => void;
  requestPublish: () => void;
};

const EditableGoal: React.FC<Props> = ({
  uuid,
  isNewGoal,
  releaseUuid,
  removeCard,
  requestPublish
}) => {
  const inferencer = useContext(AchievementContext);
  const goal = inferencer.getGoalDefinition(uuid);
  const goalClone = useMemo(() => cloneDeep(goal), [goal]);

  const [state, dispatch] = useReducer(reducer, goalClone, init);
  const [isNew, setIsNew] = useState(isNewGoal);
  const { editableGoal, isDirty } = state;
  const { meta, text } = editableGoal;

  const saveChanges = () => {
    dispatch({ type: ActionType.SAVE_CHANGES });
    inferencer.modifyGoalDefinition(editableGoal);
    if (isNew) {
      releaseUuid();
      setIsNew(false);
    }
    requestPublish();
  };

  const discardChanges = () => dispatch({ type: ActionType.DISCARD_CHANGES, payload: goalClone });

  const deleteGoal = () => {
    dispatch({ type: ActionType.DELETE_GOAL });
    inferencer.removeGoalDefinition(uuid);
    if (isNew) {
      releaseUuid();
      setIsNew(false);
    }
    removeCard(uuid);
    requestPublish();
  };

  const changeMeta = (meta: GoalMeta) => dispatch({ type: ActionType.CHANGE_META, payload: meta });

  const changeText = (text: string) => dispatch({ type: ActionType.CHANGE_TEXT, payload: text });

  return (
    <li className="editable-goal" id={uuid}>
      <div className="action-button">
        {isDirty ? (
          <ItemSaver discardChanges={discardChanges} saveChanges={saveChanges} />
        ) : (
          <ItemDeleter deleteItem={deleteGoal} item={text} />
        )}
      </div>
      <h3>
        <EditableText onChange={changeText} placeholder="Enter goal text here" value={text} />
      </h3>
      <div className="meta">
        <EditableMeta changeMeta={changeMeta} meta={meta} />
      </div>
    </li>
  );
};

export default EditableGoal;
