import React from 'react';

import AchievementInferencer from '../utils/AchievementInferencer';
import TaskAdder from './controlPanelTools/controlPanelUtils/TaskAdder';
import TaskUploader from './controlPanelTools/controlPanelUtils/TaskUploader';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';

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
    isDisabled,
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

  const mapAchievementIdsToEditableTask = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementTask
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        saveChanges={handleSaveChanges}
      />
    ));

  return (
    <div className="control-panel">
      <div className="control-command">
        <TaskUploader pendingUpload={pendingUpload} uploadChanges={handleUploadChanges} />
        <TaskAdder inferencer={inferencer} saveChanges={handleSaveChanges} />
      </div>
      <ul
        className="control-container"
        style={isDisabled ? { pointerEvents: 'none', opacity: '0.4' } : {}}
      >
        {mapAchievementIdsToEditableTask(inferencer.listTaskIdsbyPosition())}
      </ul>
    </div>
  );
}
export default ControlPanel;
