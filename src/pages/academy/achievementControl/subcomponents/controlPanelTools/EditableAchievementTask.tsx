import React, { useState } from 'react';

import {
  AchievementItem,
  FilterStatus
} from '../../../../../commons/achievements/AchievementTypes';
import AchievementTask from '../../../../achievements/subcomponents/AchievementTask';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';
import AchievementControlPanelTools from './AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievement: AchievementItem;
  inferencer: Inferencer;
  saveChanges: any;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { inferencer, achievement, saveChanges } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id } = editableAchievement;

  const task = (
    <AchievementTask
      id={id}
      inferencer={inferencer}
      filterStatus={FilterStatus.ALL}
      displayModal={() => {}}
      handleGlow={(id: number) => {}}
    />
  );

  return (
    <div className="edit-container">
      <div className="main-cards">{task}</div>
      <div className="editor-buttons">
        <AchievementControlPanelTools
          editableAchievement={editableAchievement}
          setEditableAchievement={setEditableAchievement}
          inferencer={inferencer}
          saveChanges={saveChanges}
        />
      </div>
    </div>
  );
}

export default EditableAchievementTask;
