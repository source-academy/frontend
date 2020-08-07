import React, { useState } from 'react';

import { AchievementItem, FilterStatus } from '../../../../features/achievement/AchievementTypes';
import AchievementTask from '../../AchievementTask';
import AchievementInferencer from '../../utils/AchievementInferencer';
import AchievementControlPanelTools from './AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievement: AchievementItem;
  inferencer: AchievementInferencer;
  setFocusId: any;
  handleGlow: any;
  saveChanges: any;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { inferencer, achievement, setFocusId, handleGlow, saveChanges } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id } = editableAchievement;

  return (
    <div className="editable-task">
      <AchievementTask
        id={id}
        inferencer={inferencer}
        filterStatus={FilterStatus.ALL}
        setFocusId={setFocusId}
        handleGlow={handleGlow}
      />
      <AchievementControlPanelTools
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        saveChanges={saveChanges}
      />
    </div>
  );
}

export default EditableAchievementTask;
