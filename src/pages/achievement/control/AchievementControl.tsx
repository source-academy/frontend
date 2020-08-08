import { noop } from 'lodash';
import React, { useEffect, useState } from 'react';

import AchievementEditor from '../../../commons/achievement/control/AchievementEditor';
import AchievementPreview from '../../../commons/achievement/control/AchievementPreview';
import GoalEditor from '../../../commons/achievement/control/GoalEditor';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { AchievementItem, GoalDefinition } from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  handleBulkUpdateAchievements: (achievements: AchievementItem[]) => void;
  handleBulkUpdateGoals: (goals: GoalDefinition[]) => void;
  handleGetAchievements: () => void;
  handleGetOwnGoals: () => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const { inferencer, handleGetAchievements, handleGetOwnGoals } = props;

  const [editorUnsavedChanges] = useState<number>(0);
  const [panelPendingUpload] = useState<boolean>(false);

  useEffect(() => {
    if (editorUnsavedChanges !== 0 || panelPendingUpload) {
      window.onbeforeunload = () => true;
    } else {
      handleGetAchievements();
      window.onbeforeunload = null;
    }
  }, [editorUnsavedChanges, panelPendingUpload, handleGetAchievements, handleGetOwnGoals]);

  const [render, setRender] = useState<boolean>();
  const forceRender = () => setRender(!render);

  return (
    <div className="AchievementControl">
      <AchievementPreview inferencer={inferencer} />

      <AchievementEditor
        inferencer={inferencer}
        updateAchievements={noop}
        editAchievement={noop}
        forceRender={forceRender}
        addUnsavedChange={noop}
        removeUnsavedChange={noop}
        removeAchievement={noop}
        removeGoal={noop}
      />

      <GoalEditor />
    </div>
  );
}

export default AchievementControl;
