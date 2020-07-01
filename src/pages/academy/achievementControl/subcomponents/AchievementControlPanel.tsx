import React from 'react';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';
import TaskAdder from './controlPanelTools/controlPanelUtils/TaskAdder';
import Inferencer from '../../../achievements/subcomponents/utils/Inferencer';

type AchievementControlPanelProps = {
  inferencer: Inferencer;
  updateAchievements: any;
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { inferencer, updateAchievements } = props;

  const mapAchievementIdsToEditableTask = (achievementIds: number[]) =>
    achievementIds.map(id => (
      <EditableAchievementTask
        key={id}
        achievement={inferencer.getAchievementItem(id)}
        inferencer={inferencer}
        updateAchievements={updateAchievements}
      />
    ));

  return (
    <div className="sample-cards">
      <ul className="display-list">{mapAchievementIdsToEditableTask(inferencer.listTaskIds())}</ul>

      <div>
        <TaskAdder
          inferencer={inferencer}
          updateAchievements={updateAchievements}
        />
      </div>
    </div>
  );
}
export default AchievementControlPanel;
