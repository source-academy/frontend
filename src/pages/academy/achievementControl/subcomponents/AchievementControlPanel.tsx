import React from 'react';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';
import AchievementControlPanelTaskAdder from './controlPanelTools/AchievementControlPanelTaskAdder';

type AchievementControlPanelProps = {
  inferencer: Inferencer;
  uploadAchievementData: any;
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { inferencer, uploadAchievementData } = props;

  const mapAchievementIdsToEditableTask = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementTask
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        uploadAchievementData={uploadAchievementData}
      />
    ));

  return (
    <div className="sample-cards">
      <ul className="display-list">{mapAchievementIdsToEditableTask(inferencer.listTaskIds())}</ul>

      <div>
        <AchievementControlPanelTaskAdder
          inferencer={inferencer}
          uploadAchievementData={uploadAchievementData}
        />
      </div>
    </div>
  );
}
export default AchievementControlPanel;
