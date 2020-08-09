import React from 'react';

import AchievementInferencer from '../utils/AchievementInferencer';
import TaskAdder from './controlPanelTools/controlPanelUtils/TaskAdder';
import TaskUploader from './controlPanelTools/controlPanelUtils/TaskUploader';

type ControlPanelProps = {
  inferencer: AchievementInferencer;
  updateAchievements: any;
  forceRender: any;
  isDisabled: boolean;

  pendingUpload: any;
  setPendingUpload: any;
  saveAchievementsToFrontEnd: any;
};

function ControlPanel(props: ControlPanelProps) {
  const {
    inferencer,
    updateAchievements,
    forceRender,
    pendingUpload,
    setPendingUpload,
    saveAchievementsToFrontEnd
  } = props;

  const handleSaveChanges = () => {
    setPendingUpload(true);
    saveAchievementsToFrontEnd(inferencer.getAchievements());
    forceRender();
  };

  const handleUploadChanges = () => {
    updateAchievements();
    setPendingUpload(false);
    forceRender();
  };

  return (
    <div className="control-panel">
      <div className="command-buttons">
        <TaskAdder inferencer={inferencer} saveChanges={handleSaveChanges} />
        <TaskUploader pendingUpload={pendingUpload} uploadChanges={handleUploadChanges} />
      </div>
    </div>
  );
}

export default ControlPanel;
