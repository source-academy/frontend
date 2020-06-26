import React from 'react';

// import { Button } from '@blueprintjs/core';

import AchievementControlPanelPrerequisiteDeleter from './AchievementControlPanelPrerequisiteDeleter';
import AchievementControlPanelPrerequisiteAdder from './AchievementControlPanelPrerequisiteAdder';
import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import Inferencer from '../../../../../pages/academy/achievements/subcomponents/utils/Inferencer';
import AchievementControlPanelTaskDeleter from './AchievementControlPanelTaskDeleter';

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
      <AchievementControlPanelPrerequisiteAdder
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
        editAchievement={editAchievement}
      />

      <AchievementControlPanelPrerequisiteDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
        editAchievement={editAchievement}
      />

      <AchievementControlPanelTaskDeleter
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
