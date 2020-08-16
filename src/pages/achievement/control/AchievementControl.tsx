import React, { useEffect, useState } from 'react';
import AchievementPreview from 'src/commons/achievement/control/AchievementPreview';

import AchievementEditor from '../../../commons/achievement/control/AchievementEditor';
import GoalEditor from '../../../commons/achievement/control/GoalEditor';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { AchievementGoal, AchievementItem } from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  handleEditAchievement: (achievement: AchievementItem) => void;
  handleGetAchievements: () => void;
  handleRemoveAchievement: (achievement: AchievementItem) => void;
  handleRemoveGoal: (goal: AchievementGoal, achievement: AchievementItem) => void;
  handleSaveAchievements: (achievements: AchievementItem[]) => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    inferencer,
    handleEditAchievement,
    handleGetAchievements,
    handleRemoveAchievement,
    handleRemoveGoal
  } = props;

  const [editorUnsavedChanges, setEditorUnsavedChanges] = useState<number>(0);
  const [panelPendingUpload] = useState<boolean>(false);

  useEffect(() => {
    if (editorUnsavedChanges !== 0 || panelPendingUpload) {
      window.onbeforeunload = () => true;
    } else {
      handleGetAchievements();
      window.onbeforeunload = null;
    }
  }, [handleGetAchievements, editorUnsavedChanges, panelPendingUpload]);

  const addUnsavedChanges = (changes: number) =>
    setEditorUnsavedChanges(editorUnsavedChanges + changes);

  const addUnsavedChange = () => addUnsavedChanges(1);
  const removeUnsavedChange = () => addUnsavedChanges(-1);

  const updateAchievements = () => {
    for (const achievement of inferencer.getAchievements()) {
      handleEditAchievement(achievement);
    }
  };

  const [render, setRender] = useState<boolean>();
  const forceRender = () => setRender(!render);

  return (
    <div className="AchievementControl">
      <AchievementPreview inferencer={inferencer} />

      <AchievementEditor
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        editAchievement={handleEditAchievement}
        forceRender={forceRender}
        addUnsavedChange={addUnsavedChange}
        removeUnsavedChange={removeUnsavedChange}
        removeAchievement={handleRemoveAchievement}
        removeGoal={handleRemoveGoal}
      />

      <GoalEditor />
    </div>
  );
}

export default AchievementControl;
