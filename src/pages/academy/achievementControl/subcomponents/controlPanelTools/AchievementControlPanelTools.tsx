import React from 'react';

// import { Button } from '@blueprintjs/core';

import AchievementPrerequisiteDeleter from './controlPanelUtils/AchievementPrerequisiteDeleter';
import AchievementPrerequisiteAdder from './controlPanelUtils/AchievementPrerequisiteAdder';
import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../../pages/academy/achievements/subcomponents/utils/Inferencer';
import AchievementTaskDeleter from './controlPanelUtils/AchievementTaskDeleter';

type AchievementControlPanelToolsProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievementData: any;
  editAchievement: any;
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const {
    editableAchievement,
    setEditableAchievement,
    inferencer,
    uploadAchievementData,
    editAchievement
  } = props;

  return (
    <>
      <AchievementPrerequisiteAdder
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
        editAchievement={editAchievement}
      />

      <AchievementPrerequisiteDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
        editAchievement={editAchievement}
      />

      <AchievementTaskDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
        editAchievement={editAchievement}
      />
    </>
  );
}

export default AchievementControlPanelTools;
