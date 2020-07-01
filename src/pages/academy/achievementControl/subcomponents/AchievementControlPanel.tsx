import React, { useState } from 'react';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';
import TaskAdder from './controlPanelTools/controlPanelUtils/TaskAdder';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';
import TaskUploader from './controlPanelTools/controlPanelUtils/TaskUploader';

type AchievementControlPanelProps = {
  inferencer: Inferencer;
  updateAchievements: any;
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { inferencer, updateAchievements } = props;

  const [pendingUpload, setPendingUpload] = useState<boolean>(false);
  const togglePendingUpload = () => setPendingUpload(true);

  const handleUploadChanges = () => {
    updateAchievements();
    setPendingUpload(false);
  };

  const mapAchievementIdsToEditableTask = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementTask
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        saveChanges={togglePendingUpload}
      />
    ));

  return (
    <div className="sample-cards">
      <ul className="display-list">{mapAchievementIdsToEditableTask(inferencer.listTaskIds())}</ul>

      <div>
        <TaskUploader pendingUpload={pendingUpload} uploadChanges={handleUploadChanges} />
        <TaskAdder inferencer={inferencer} saveChanges={togglePendingUpload} />
      </div>
    </div>
  );
}
export default AchievementControlPanel;
