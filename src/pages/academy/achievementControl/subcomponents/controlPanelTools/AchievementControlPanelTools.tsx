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
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const {
    editableAchievement,
    setEditableAchievement,
    inferencer,
    updateAchievements
  } = props;

  return (
    <>
      <PrerequisiteAdder
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
      />

      <PrerequisiteDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
      />

      <TaskDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
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
