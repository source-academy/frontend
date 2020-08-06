import React, { useEffect, useState } from 'react';

import AchievementEditor from '../../../commons/achievement/control/AchievementEditor';
import ControlPanel from '../../../commons/achievement/control/ControlPanel';
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
    handleRemoveGoal,
    handleSaveAchievements
  } = props;

  const [editorUnsavedChanges, setEditorUnsavedChanges] = useState<number>(0);
  const [panelPendingUpload, setPanelPendingUpload] = useState<boolean>(false);

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
      <ControlPanel
        inferencer={inferencer}
        updateAchievements={updateAchievements}
        forceRender={forceRender}
        isDisabled={editorUnsavedChanges !== 0}
        pendingUpload={panelPendingUpload}
        setPendingUpload={setPanelPendingUpload}
        saveAchievementsToFrontEnd={handleSaveAchievements}
      />

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
    </div>
  );
}

export default AchievementControl;
