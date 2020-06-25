import React from 'react';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';
import AchievementControlPanelTaskAdder from './controlPanelTools/AchievementControlPanelTaskAdder';
/*
import EditableAchievementTask from './controlPanelTools/EditableAchievementTask';
import { FilterStatus } from '../../../../commons/achievements/AchievementTypes';
import AchievementControlPanelTaskAdder from './controlPanelTools/AchievementControlPanelTaskAdder';
import Inferencer from '../../achievements/subcomponents/utils/Inferencer';

type AchievementControlPanelProps = {
  inferencer: Inferencer
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { inferencer } = props;

  const [achievementItems, setAchievementItems] = useState(achievementDict);

  const _inferencer = new Inferencer(achievementDict);

  _inferencer.logInfo();

  const achievementTasks = mapAchievementDictToTask(
    achievementItems,
    FilterStatus.ALL,
    studentProgress,
    _inferencer
  );

  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <EditableAchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        />
    ))

  const [currentTasks, setCurrentTasks] = useState(achievementTasks); // Here

  const resetCurrentTasks = () => {
    setCurrentTasks(
      mapAchievementDictToTask(achievementItems, FilterStatus.ALL, studentProgress, _inferencer)
    );
  };

  const editableTasks = currentTasks.map(task => (
    <EditableAchievementTask
      key={task.props.achievement.id}
      achievementItems={achievementItems}
      setAchievementItems={setAchievementItems}
      resetCurrentTasks={resetCurrentTasks}
      task={task}
      id={task.props.achievement.id}
    />
  ));

  return (
    <div className="sample-cards">
      <ul className="display-list">{editableTasks}</ul>

      <div>
        <AchievementControlPanelTaskAdder
          achievementItems={achievementItems}
          setAchievementItems={setAchievementItems}
          resetCurrentTasks={resetCurrentTasks}
          pendingTasks={_inferencer.getNonTaskAchievementsItems()}
        />
      </div>
    </div>
  );
}
*/

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
