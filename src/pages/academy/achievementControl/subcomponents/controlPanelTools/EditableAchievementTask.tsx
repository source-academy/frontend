import React, { useState } from 'react';
import {
  AchievementItem,
  FilterStatus
} from '../../../../../commons/achievements/AchievementTypes';
import AchievementControlPanelTools from './AchievementControlPanelTools';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';
import AchievementTask from '../../../achievements/subcomponents/AchievementTask';

type EditableAchievementTaskProps = {
  achievement: AchievementItem;
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { inferencer, achievement, updateAchievements, editAchievement } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id } = editableAchievement;

  const task = (
    <AchievementTask
      id={id}
      inferencer={inferencer}
      filterStatus={FilterStatus.ALL}
      displayModal={() => {}}
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
          updateAchievements={updateAchievements}
          editAchievement={editAchievement}
        />
      </div>
    </div>
  );
}

export default EditableAchievementTask;
