import React, { useState } from 'react';

import { AchievementItem, FilterStatus } from '../../../../features/achievement/AchievementTypes';
import AchievementTask from '../../AchievementTask';
import AchievementInferencer from '../../utils/AchievementInferencer';
import AchievementControlPanelTools from './AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievement: AchievementItem;
  inferencer: AchievementInferencer;
  saveChanges: any;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { inferencer, achievement, saveChanges } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id } = editableAchievement;

  return (
    <div className="editable-task">
      <AchievementTask
        id={id}
        inferencer={inferencer}
        filterStatus={FilterStatus.ALL}
        handleGlow={(id: number) => {}}
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
