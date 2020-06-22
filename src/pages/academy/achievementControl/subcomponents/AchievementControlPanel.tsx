import React from 'react';
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

type AchievementControlPanelProps = {};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  return <div>Achievement Control Panel</div>;
}
export default AchievementControlPanel;
