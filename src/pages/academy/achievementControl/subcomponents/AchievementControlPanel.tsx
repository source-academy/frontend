import React from 'react';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';
import AchievementTaskAdder from './controlPanelTools/controlPanelUtils/AchievementTaskAdder';

type AchievementControlPanelProps = {
  inferencer: Inferencer;
  uploadAchievementData: any;
  editAchievement: any;
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { inferencer, uploadAchievementData, editAchievement } = props;

  const mapAchievementIdsToEditableTask = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementTask
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
        editAchievement={editAchievement}
      />
    ));

  return (
    <div className="sample-cards">
      <ul className="display-list">{mapAchievementIdsToEditableTask(inferencer.listTaskIds())}</ul>

      <div>
        <AchievementTaskAdder
          inferencer={inferencer}
          uploadAchievementData={uploadAchievementData}
          editAchievement={editAchievement}
        />
      </div>
    </div>
  );
}
export default AchievementControlPanel;
