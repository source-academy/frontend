import React from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementControlPanelTools from './controlPanelTools/AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievementItems: { [id: number]: AchievementItem };
  setAchievementItems?: any;
  currentTasks: any[];
  setCurrentTasks: any;
  task: any;
  id: number;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { achievementItems, setAchievementItems, currentTasks, setCurrentTasks, task, id } = props;

  const mapPrerequisiteIDsToAchievements = (prereqIDs: number[] | undefined) => {
    if (prereqIDs === undefined) {
      return [];
    }

    return prereqIDs.map(prereqId => achievementItems[prereqId]);
  };

  const getAllAchievementIDs = () => {
    return Object.values(achievementItems).map(achievement => achievement.id);
  };

  const getPrerequisiteIDs = () => {
    if (achievementItems[id] === undefined || achievementItems[id].prerequisiteIDs === undefined) {
      return [];
    }

    return achievementItems[id].prerequisiteIDs;
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
    setAchievementItems({});
  };

  const deletePrerequisite = () => {
    console.log(mapPrerequisiteIDsToAchievements(getNonPrerequisitesIDs()));
  };

  const deleteTask = () => {
    for (let i = 0; i < currentTasks.length; i++) {
      if (currentTasks[i].props.achievement.id === id) {
        setCurrentTasks(currentTasks.filter(task => task.props.achievement.id !== id));
      }
    }
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
