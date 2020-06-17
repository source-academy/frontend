import React, { useState } from 'react';
import EditableAchievementTask from './EditableAchievementTask';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { studentProgress } from '../../../../commons/mocks/AchievementMocks';
import { FilterStatus } from '../../../../commons/achievements/AchievementTypes';
import { mapAchievementDictToTask } from '../../achievements/Achievement';
import AchievementControlPanelTaskAdder from './controlPanelTools/AchievementControlPanelTaskAdder';

type AchievementControlPanelProps = {
  achievementDict: { [id: number]: AchievementItem };
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { achievementDict } = props;

  const [achievementItems, setAchievementItems] = useState(achievementDict);

  const achievementTasks = mapAchievementDictToTask(
    achievementItems,
    FilterStatus.ALL,
    studentProgress
  );

  const [currentTasks, setCurrentTasks] = useState(achievementTasks);

  const resetCurrentTasks = () => {
    setCurrentTasks(mapAchievementDictToTask(achievementItems, FilterStatus.ALL, studentProgress));
  };

  const currentTaskIDs = currentTasks.map(item => item.props.achievement.id);

  const getPendingTasks = () => {
    return Object.values(achievementItems).filter(item => !currentTaskIDs.includes(item.id));
  };

  const editableTasks = currentTasks.map(task => (
    <EditableAchievementTask
      key={task.props.achievement.id}
      achievementItems={achievementItems}
      setAchievementItems={setAchievementItems}
      currentTasks={currentTasks}
      resetCurrentTasks={resetCurrentTasks}
      setCurrentTasks={setCurrentTasks}
      task={task}
      id={task.props.achievement.id}
    />
  ));

  return (
    <div className="sample-cards">
      <ul className="display-list">{editableTasks}</ul>

      <div>
        <AchievementControlPanelTaskAdder pendingTasks={getPendingTasks()} />
      </div>
    </div>
  );
}

export default AchievementControlPanel;
