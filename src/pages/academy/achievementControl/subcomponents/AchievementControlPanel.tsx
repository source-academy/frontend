import React from 'react';
import { mapAchievementDictToTask } from '../../achievements/Achievement';
import { achievementDict, studentProgress } from '../../../../commons/mocks/AchievementMocks';
import { FilterStatus } from '../../../../commons/achievements/AchievementTypes';
import EditableAchievementTask from './EditableAchievementTask';
import { Button } from '@blueprintjs/core';

type AchievementControlPanelProps = {};

const hack = () => {};

const achievementTasks: JSX.Element[] = mapAchievementDictToTask(
  achievementDict,
  FilterStatus.ALL,
  hack,
  studentProgress
);

const mapTasksToEditableTasks = achievementTasks.map(task => (
  <EditableAchievementTask task={task} />
));

function AchievementControlPanel(props: AchievementControlPanelProps) {
  return (
    <div className="sample-cards">
      <ul className="display-list">{mapTasksToEditableTasks}</ul>

      <div>
        <Button className="main-adder" text={'Add New Task'} />
      </div>
    </div>
  );
}

export default AchievementControlPanel;
