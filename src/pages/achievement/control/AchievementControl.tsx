import React, { useEffect, useState } from 'react';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import { AchievementGoal, AchievementItem } from '../../../features/achievement/AchievementTypes';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

export type DispatchProps = {
  handleFetchAchievements: () => void;
  handleSaveAchievements: (achievements: AchievementItem[]) => void;
  handleEditAchievement: (achievement: AchievementItem) => void;
  handleRemoveGoal: (goal: AchievementGoal, achievement: AchievementItem) => void;
  handleRemoveAchievement: (achievement: AchievementItem) => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    inferencer,
    handleFetchAchievements,
    handleSaveAchievements,
    handleEditAchievement,
    handleRemoveGoal,
    handleRemoveAchievement
  } = props;

  const [editorUnsavedChanges, setEditorUnsavedChanges] = useState<number>(0);
  const [panelPendingUpload, setPanelPendingUpload] = useState<boolean>(false);

  useEffect(() => {
    if (editorUnsavedChanges !== 0 || panelPendingUpload) {
      window.onbeforeunload = () => true;
    }

    if (editorUnsavedChanges === 0 && !panelPendingUpload) {
      handleFetchAchievements();
      window.onbeforeunload = null;
    }
  }, [handleFetchAchievements, editorUnsavedChanges, panelPendingUpload]);

  const addUnsavedChange = () => setEditorUnsavedChanges(editorUnsavedChanges + 1);
  const removeUnsavedChange = () => setEditorUnsavedChanges(editorUnsavedChanges - 1);

  const updateAchievements = () => {
    for (const achievement of inferencer.getAchievements()) {
      editAchievement(achievement);
    }
  };

  const editAchievement = (achievement: AchievementItem) => {
    handleEditAchievement(achievement);
  };

  const [render, setRender] = useState<boolean>();
  const forceRender = () => setRender(!render);

  return (
    <>
      <div className="AchievementControl">
        <AchievementControlPanel
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
          editAchievement={editAchievement}
          forceRender={forceRender}
          addUnsavedChange={addUnsavedChange}
          removeUnsavedChange={removeUnsavedChange}
          removeAchievement={handleRemoveAchievement}
          removeGoal={handleRemoveGoal}
        />
      </div>
    </>
  );
}

export default AchievementControl;
