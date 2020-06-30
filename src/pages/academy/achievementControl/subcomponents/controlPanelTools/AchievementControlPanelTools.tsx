import React from 'react';

// import { Button } from '@blueprintjs/core';

import AchievementPrerequisiteDeleter from './controlPanelUtils/AchievementPrerequisiteDeleter';
import AchievementPrerequisiteAdder from './controlPanelUtils/AchievementPrerequisiteAdder';
import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import AchievementTaskDeleter from './controlPanelUtils/AchievementTaskDeleter';
import AchievementTaskPositionEditor from './controlPanelUtils/AchievementTaskPositionEditor';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';
import AchievementTaskPrerequisitesEditor from './controlPanelUtils/AchievementTaskPrerequisitesEditor';

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
      <AchievementPrerequisiteAdder
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
      />

      <AchievementPrerequisiteDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
      />

      <AchievementTaskDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={editAchievement}
      />

      <AchievementTaskPositionEditor
        editableAchievement={editableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
      />

      <AchievementTaskPrerequisitesEditor
        editableAchievement={editableAchievement}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
      />
    </>
  );
}

export default AchievementControlPanelTools;
