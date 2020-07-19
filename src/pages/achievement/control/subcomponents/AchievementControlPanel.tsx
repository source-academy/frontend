import React from 'react';

import AchievementInferencer from '../../dashboard/subcomponents/utils/AchievementInferencer';
import TaskAdder from './controlPanelTools/controlPanelUtils/TaskAdder';
import TaskUploader from './controlPanelTools/controlPanelUtils/TaskUploader';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';

type AchievementControlPanelProps = {
  inferencer: AchievementInferencer;
  updateAchievements: any;
  forceRender: any;
  isDisabled: boolean;

  pendingUpload: any;
  setPendingUpload: any;
  saveAchievementsToFrontEnd: any;
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
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
    <div
      className="sample-cards"
      style={isDisabled ? { pointerEvents: 'none', opacity: '0.4' } : {}}
    >
      <ul className="display-list">
        {mapAchievementIdsToEditableTask(inferencer.listTaskIdsbyPosition())}
      </ul>

      <div>
        <TaskUploader pendingUpload={pendingUpload} uploadChanges={handleUploadChanges} />
        <TaskAdder inferencer={inferencer} saveChanges={handleSaveChanges} />
      </div>
    </div>
  );
}
export default AchievementControlPanel;
