import React from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementControlPanelTools from './controlPanelTools/AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievementDict: { [id: number]: AchievementItem };
  setCurrentTasks?: any;
  currentTasks: any[];
  task: any;
  id: number;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { achievementDict, setCurrentTasks, currentTasks, task, id } = props;

  const mapPrerequisiteIDsToAchievements = (prereqIDs: number[] | undefined) => {
    if (prereqIDs === undefined) {
      return [];
    }

    return prereqIDs.map(prereqId => achievementDict[prereqId]);
  };

  const getAllAchievementIDs = () => {
    return Object.values(achievementDict).map(achievement => achievement.id);
  };

  const getPrerequisiteIDs = () => {
    if (achievementDict[id] === undefined || achievementDict[id].prerequisiteIDs === undefined) {
      return [];
    }

    return achievementDict[id].prerequisiteIDs;
  };

  const getNonPrerequisitesIDs = () => {
    const prerequisiteIDs = getPrerequisiteIDs();
    const achievementIDs = getAllAchievementIDs();

    if (prerequisiteIDs === undefined) {
      return achievementIDs;
    }

    return achievementIDs.filter(achievementID => !prerequisiteIDs.includes(achievementID));
  };

  const addPrerequisite = () => {
    console.log(id);
  };

  const deletePrerequisite = () => {
    console.log(mapPrerequisiteIDsToAchievements(getNonPrerequisitesIDs()));
  };

  const deleteTask = () => {
    for (let i = 0; i < currentTasks.length; i++) {
      if (currentTasks[i].props.achievement.id === id) {
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
