import { EditableText } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useContext, useState } from 'react';
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

function EditableGoal(props: EditableGoalProps) {
  const { id, releaseId, requestPublish } = props;

  const inferencer = useContext(AchievementContext);
  const goalReference = inferencer.getGoalDefinition(id);

  const [editableGoal, setEditableGoal] = useState<GoalDefinition>(
    () => cloneDeep(goalReference) // Expensive, only clone once on initialization
  );
  const resetEditableGoal = () => setEditableGoal(cloneDeep(goalReference));
  const { text, meta } = editableGoal;

  // A save/discard button appears on top of the card when it's dirty
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // TODO: Replace the following 3 useState with useReducer for state management & cleanup
  const handleSaveChanges = () => {
    inferencer.modifyGoalDefinition(editableGoal);
    setIsDirty(false);
    releaseId(id);
    requestPublish();
  };

  const handleDiscardChanges = () => {
    resetEditableGoal();
    setIsDirty(false);
  };

  const handleDeleteGoal = () => {
    inferencer.removeGoalDefinition(id);
    setIsDirty(false);
    releaseId(id);
    requestPublish();
  };

  // TODO: Replace all of the following useState with useReducer for editable content
  const handleChangeText = (text: string) => {
    setEditableGoal({
      ...editableGoal,
      text: text
    });
    setIsDirty(true);
  };

  const handleChangeMeta = (meta: GoalMeta) => {
    setEditableGoal({
      ...editableGoal,
      meta: meta
    });
    setIsDirty(true);
  };

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
