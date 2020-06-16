import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import EditableAchievementTask from './EditableAchievementTask';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

type AchievementControlPanelProps = {
  achievementDict: { [id: number]: AchievementItem };
  achievementTasks: any[];
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { achievementDict, achievementTasks } = props;

  const [currentTasks, setCurrentTasks] = useState<JSX.Element[]>(achievementTasks);
  const editableTasks = currentTasks.map(task => (
    <EditableAchievementTask
      achievementDict={achievementDict}
      setCurrentTasks={setCurrentTasks}
      currentTasks={currentTasks}
      task={task}
    />
  ));

  return (
    <div className="sample-cards">
      <ul className="display-list">{editableTasks}</ul>

      <div>
        <Button className="main-adder" text={'Add New Task'} />
      </div>
    </div>
  );
}

export default AchievementControlPanel;
