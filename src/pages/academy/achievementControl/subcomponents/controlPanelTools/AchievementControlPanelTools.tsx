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

      <TaskPositionEditor
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
