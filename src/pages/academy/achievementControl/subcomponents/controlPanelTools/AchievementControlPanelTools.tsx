import React from 'react';

// import { Button } from '@blueprintjs/core';

import AchievementControlPanelPrerequisiteDeleter from './AchievementControlPanelPrerequisiteDeleter';
import AchievementControlPanelPrerequisiteAdder from './AchievementControlPanelPrerequisiteAdder';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';
import AchievementControlPanelTaskDeleter from './AchievementControlPanelTaskDeleter';

type AchievementControlPanelToolsProps = {
  editableAchievement: AchievementItem;
  setEditableAchievement: any;
  inferencer: Inferencer;
  uploadAchievementData: any;
};

function AchievementControlPanelTools(props: AchievementControlPanelToolsProps) {
  const { editableAchievement, setEditableAchievement, inferencer, uploadAchievementData } = props;

  return (
    <>
      <AchievementControlPanelPrerequisiteAdder
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
      />

      <AchievementControlPanelPrerequisiteDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
      />

      <AchievementControlPanelTaskDeleter
        editableAchievement={editableAchievement}
        setEditableAchievement={setEditableAchievement}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
      />
    </>
  );
}

export default AchievementControlPanelTools;
