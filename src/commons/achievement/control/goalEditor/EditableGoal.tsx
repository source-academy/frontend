import { EditableText } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { GoalDefinition } from 'src/features/achievement/AchievementTypes';

import ItemDeleter from '../ItemDeleter';
import ItemSaver from '../ItemSaver';

type EditableGoalProps = {
  id: number;
  forceRender: () => void;
  releaseId: (id: number) => void;
  requestPublish: () => void;
};

function EditableGoal(props: EditableGoalProps) {
  const { id, forceRender, releaseId, requestPublish } = props;

  const inferencer = useContext(AchievementContext);
  const goalReference = inferencer.getGoalDefinition(id);

  const [editableGoal, setEditableGoal] = useState<GoalDefinition>(
    () => cloneDeep(goalReference) // Expensive, only clone once on initialization
  );
  const resetEditableGoal = () => setEditableGoal(cloneDeep(goalReference));
  const { text, maxExp, meta } = editableGoal;

  // A save/discard button appears on top of the card when it's dirty
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // TODO: Replace the following 3 useState with useReducer for state management & cleanup
  const handleSaveChanges = () => {
    inferencer.modifyGoalDefinition(editableGoal);
    setIsDirty(false);
    releaseId(id);
    requestPublish();
    forceRender();
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
    forceRender();
  };

  // TODO: Replace all of the following useState with useReducer for editable content
  const handleChangeText = (text: string) => {
    setEditableGoal({
      ...editableGoal,
      text: text
    });
    setIsDirty(true);
  };

  const handleChangeMaxExp = (maxExpString: string) => {
    const maxExp = isNaN(parseInt(maxExpString)) ? 0 : parseInt(maxExpString);
    setEditableGoal({
      ...editableGoal,
      maxExp: maxExp
    });
    setIsDirty(true);
  };

  const handleChangeMeta = (metaString: string) => {
    const meta = JSON.parse(metaString);
    setEditableGoal({
      ...editableGoal,
      meta: meta
    });
    setIsDirty(true);
  };

  return (
    <div className="editable-goal">
      <h3>{id}</h3>
      <EditableText placeholder="Enter goal text here" value={text} onChange={handleChangeText} />
      <EditableText
        placeholder="Enter max EXP here"
        value={String(maxExp)}
        onChange={handleChangeMaxExp}
      />
      <EditableText
        placeholder="Enter goal meta here"
        value={JSON.stringify(meta)}
        onChange={handleChangeMeta}
      />
      <div className="status">
        {isDirty ? (
          <ItemSaver discardChanges={handleDiscardChanges} saveChanges={handleSaveChanges} />
        ) : (
          <ItemDeleter deleteItem={handleDeleteGoal} />
        )}
      </div>
    </div>
  );
}

export default EditableGoal;
