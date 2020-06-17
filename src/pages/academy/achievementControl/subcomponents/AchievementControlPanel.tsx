import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import EditableAchievementTask from './EditableAchievementTask';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { studentProgress } from '../../../../commons/mocks/AchievementMocks';
import { FilterStatus } from '../../../../commons/achievements/AchievementTypes';
import { mapAchievementDictToTask } from '../../achievements/Achievement';


type AchievementControlPanelProps = {
  achievementDict: { [id: number]: AchievementItem };
};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  const { achievementDict } = props;

  const [ achievementItems, setAchievementItems ] = useState(achievementDict);

  const achievementTasks = mapAchievementDictToTask(
    achievementItems,
    FilterStatus.ALL,
    studentProgress
  );

  const [ currentTasks, setCurrentTasks ] = useState(achievementTasks);

  const editableTasks = currentTasks.map(task => (
    <EditableAchievementTask
      achievementItems={achievementItems}
      setAchievementItems={setAchievementItems}
      currentTasks={currentTasks}
      setCurrentTasks={setCurrentTasks}
      task={task}
      id={task.props.achievement.id}
    />
  ));

  return (
    <div className="sample-cards">
      <ul className="display-list">
        {editableTasks}
       </ul>

      <div>
        <Button className="main-adder" text={'Add New Task'} />
      </div>
    </div>
  );
}

export default AchievementControlPanel;
