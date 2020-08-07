import React, { useState } from 'react';

import { AchievementItem } from '../../../../features/achievement/AchievementTypes';
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

  return (
    <div className="editable-task">
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
