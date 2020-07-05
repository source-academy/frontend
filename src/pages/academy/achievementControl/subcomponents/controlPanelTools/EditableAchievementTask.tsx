import React, { useState } from 'react';
import {
  AchievementItem,
  FilterStatus,
  AchievementAbility
} from '../../../../../commons/achievements/AchievementTypes';
import AchievementControlPanelTools from './AchievementControlPanelTools';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';
import AchievementTask from '../../../../achievements/subcomponents/AchievementTask';

type EditableAchievementTaskProps = {
  achievement: AchievementItem;
  inferencer: Inferencer;
  saveChanges: any;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { inferencer, achievement, saveChanges } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id } = editableAchievement;

  const generateBackgroundGradient = (ability: AchievementAbility) => {
    switch (ability) {
      case 'Academic':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(98, 89, 0, 0.8))`;
      case 'Community':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(247, 3, 240, 0.8))`;
      case 'Effort':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(77, 77, 77, 0.8))`;
      case 'Exploration':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(10, 125, 78, 0.8))`;
      default:
        return ``;
    }
  };

  const task = (
    <AchievementTask
      generateBackgroundGradient={generateBackgroundGradient}
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
