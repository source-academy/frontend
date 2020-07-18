import React from 'react';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import { AchievementItem } from '../../../../../commons/achievement/AchievementTypes';
import PrerequisiteAdder from './controlPanelUtils/PrerequisiteAdder';
import PrerequisiteDeleter from './controlPanelUtils/PrerequisiteDeleter';
import PrerequisitePositionEditor from './controlPanelUtils/PrerequisitePositionEditor';
import TaskDeleter from './controlPanelUtils/TaskDeleter';
import TaskPositionInserter from './controlPanelUtils/TaskPositionInserter';

type AchievementControlPanelToolsProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: AchievementInferencer;
  saveChanges: any;
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const { editableAchievement, setEditableAchievement, inferencer, saveChanges } = props;

  return (
    <>
      <PrerequisiteAdder
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        saveChanges={saveChanges}
      />

      <PrerequisiteDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        saveChanges={saveChanges}
      />

      <TaskDeleter
        editableAchievement={editableAchievement}
        inferencer={inferencer}
        saveChanges={saveChanges}
      />

      <TaskPositionInserter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        saveChanges={saveChanges}
      />

      <PrerequisitePositionEditor
        editableAchievement={editableAchievement}
        inferencer={inferencer}
        saveChanges={saveChanges}
      />
    </>
  );
}

export default AchievementControlPanelTools;
