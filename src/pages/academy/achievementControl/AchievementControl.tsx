import React, { useEffect, useState } from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import { AchievementItem } from '../../../commons/achievements/AchievementTypes';

export type DispatchProps = {
  handleFetchAchievements: () => void;
  handleSaveAchievements: (achievements: AchievementItem[]) => void;
  handleUpdateAchievements: (achievements: AchievementItem[]) => void;
  handleEditAchievement: (achievement: AchievementItem) => void;
};

export type StateProps = {
  inferencer: Inferencer;
};

function AchievementControl(props: DispatchProps & StateProps) {
  const {
    inferencer,
    handleFetchAchievements,
    handleUpdateAchievements,
    handleSaveAchievements, 
    handleEditAchievement
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
  }, [editorUnsavedChanges, panelPendingUpload]);

  const addUnsavedChange = () => setEditorUnsavedChanges(editorUnsavedChanges + 1);
  const removeUnsavedChange = () => setEditorUnsavedChanges(editorUnsavedChanges - 1);

  const updateAchievements = () => {
    handleUpdateAchievements(inferencer.getAchievements());
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
        />
      </div>
    </>
  );
}

export default AchievementControl;
