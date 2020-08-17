import { EditableText } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useContext, useMemo, useReducer } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { GoalDefinition, GoalMeta } from 'src/features/achievement/AchievementTypes';

import ItemDeleter from '../common/ItemDeleter';
import ItemSaver from '../common/ItemSaver';
import EditableMeta from './EditableMeta';

type EditableGoalProps = {
  id: number;
  releaseId: (id: number) => void;
  requestPublish: () => void;
};

const reducer = (
  state: { editableGoal: GoalDefinition; isDirty: boolean },
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
        editableGoal: action.payload,
        isDirty: false
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        isDirty: false
      };
    case 'CHANGE_TEXT':
      return {
        editableGoal: {
          ...state.editableGoal,
          text: action.payload
        },
        isDirty: true
      };
    case 'CHANGE_META':
      return {
        editableGoal: {
          ...state.editableGoal,
          meta: action.payload
        },
        isDirty: true
      };
    default:
      return state;
  }
};

const initialState = {
  editableGoal: {} as GoalDefinition,
  isDirty: false
};

function EditableGoal(props: EditableGoalProps) {
  const { id, releaseId, requestPublish } = props;

  const inferencer = useContext(AchievementContext);
  const goal = inferencer.getGoalDefinition(id);
  const goalClone = useMemo(() => cloneDeep(goal), [goal]);

  const [state, dispatch] = useReducer(reducer, { ...initialState, editableGoal: goalClone });
  const { editableGoal, isDirty } = state;
  const { text, meta } = editableGoal;

  const handleDiscardChanges = () => dispatch({ type: 'DISCARD_CHANGES', payload: goalClone });

  const handleSaveChanges = () => {
    dispatch({ type: 'SAVE_CHANGES' });
    inferencer.modifyGoalDefinition(editableGoal);
    releaseId(id);
    requestPublish();
  };

  const handleDeleteGoal = () => {
    dispatch({ type: 'DELETE_GOAL' });
    inferencer.removeGoalDefinition(id);
    releaseId(id);
    requestPublish();
  };

  const handleChangeText = (text: string) => dispatch({ type: 'CHANGE_TEXT', payload: text });

  const handleChangeMeta = (meta: GoalMeta) => dispatch({ type: 'CHANGE_META', payload: meta });

  return (
    <li className="editable-goal">
      <div className="action-button">
        {isDirty ? (
          <ItemSaver discardChanges={handleDiscardChanges} saveChanges={handleSaveChanges} />
        ) : (
          <ItemDeleter handleDelete={handleDeleteGoal} item={text} />
        )}
      </div>
      <h3>
        <EditableText onChange={handleChangeText} placeholder="Enter goal text here" value={text} />
      </h3>
      <div className="meta">
        <EditableMeta changeMeta={handleChangeMeta} meta={meta} />
      </div>
    </li>
  );
}

export default EditableGoal;
