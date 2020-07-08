import React from 'react';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';
import TaskAdder from './controlPanelTools/controlPanelUtils/TaskAdder';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';
import TaskUploader from './controlPanelTools/controlPanelUtils/TaskUploader';

type AchievementControlPanelProps = {
  inferencer: Inferencer;
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
