import React from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementControlPanelTools from './controlPanelTools/AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievementDict: { [id: number]: AchievementItem };
  setCurrentTasks?: any;
  currentTasks: any[];
  task: any;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { achievementDict, setCurrentTasks, currentTasks, task } = props;

  console.log(achievementDict);

  const addPrerequisite = () => {
    // TODO: Implemenet
  };

  const deletePrerequisite = () => {
    // TODO: Implemenet
  };

  const deleteTask = () => {
    for (let i = 0; i < currentTasks.length; i++) {
      if (currentTasks[i].props.achievement.id === task.props.achievement.id) {
        currentTasks.splice(i, 1);
      }
    }
    setCurrentTasks(currentTasks);
  };

  return (
    <div className="edit-container">
      <div className="main-cards">{task}</div>

      <div className="editor-buttons">
        <AchievementControlPanelTools
          addPrerequisite={addPrerequisite}
          deletePrerequisite={deletePrerequisite}
          deleteTask={deleteTask}
        />
      </div>
    </div>
  );
}

export default EditableAchievementTask;
