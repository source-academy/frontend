import React from 'react';

import PrerequisiteDeleter from './controlPanelUtils/PrerequisiteDeleter';
import PrerequisiteAdder from './controlPanelUtils/PrerequisiteAdder';
import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import TaskDeleter from './controlPanelUtils/TaskDeleter';
import TaskPositionEditor from './controlPanelUtils/TaskPositionEditor';
import Inferencer from '../../../../achievements/subcomponents/utils/Inferencer';
import PrerequisitePositionEditor from './controlPanelUtils/PrerequisitePositionEditor';

type AchievementControlPanelToolsProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  updateAchievements: any;
  editAchievement: any;
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const {
    editableAchievement,
    setEditableAchievement,
    inferencer,
    updateAchievements,
    editAchievement
  } = props;

  return (
    <>
      <PrerequisiteAdder
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
      />

      <PrerequisiteDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
      />

      <TaskDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
      />

      <TaskPositionEditor
        editableAchievement={editableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
      />

      <PrerequisitePositionEditor
        editableAchievement={editableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
      />
    </>
  );
}

export default AchievementControlPanelTools;
