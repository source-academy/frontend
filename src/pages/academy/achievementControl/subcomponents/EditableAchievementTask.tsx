import React from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementControlPanelTools from './controlPanelTools/AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievementItems: { [id: number]: AchievementItem };
  setAchievementItems?: any;
  currentTasks: any[];
  resetCurrentTasks: any;
  setCurrentTasks: any;
  task: any;
  id: number;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const {
    achievementItems,
    setAchievementItems,
    currentTasks,
    resetCurrentTasks,
    setCurrentTasks,
    task,
    id
  } = props;

  /* Helpers to Retrieve Prerequisites */

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

    return achievementIDs
      .filter(achievementID => !prerequisiteIDs.includes(achievementID))
      .filter(achievementID => achievementID !== id);
  };

  /* Functions to Modify Prerequisites */

  const addPrerequisite = (taskID: number, prereqID: number) => {
    if (achievementItems[prereqID] === undefined) {
      return;
    }

    if (achievementItems[taskID].prerequisiteIDs === undefined) {
      achievementItems[taskID].prerequisiteIDs = [];
    }

    if (achievementItems[taskID].prerequisiteIDs?.includes(prereqID)) {
      return;
    }

    achievementItems[taskID].prerequisiteIDs?.push(prereqID);
    setAchievementItems(achievementItems);
    resetCurrentTasks();
  };

  const deletePrerequisite = (taskID: number, prereqID: number) => {
    if (achievementItems[prereqID] === undefined) {
      return;
    }

    achievementItems[taskID].prerequisiteIDs = achievementItems[taskID].prerequisiteIDs?.filter(
      id => id !== prereqID
    );
    setAchievementItems(achievementItems);
    resetCurrentTasks();
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
          prerequisites={mapPrerequisiteIDsToAchievements(getPrerequisiteIDs())}
          nonPrerequisites={mapPrerequisiteIDsToAchievements(getNonPrerequisitesIDs())}
          deleteTask={deleteTask}
          taskID={id}
        />
      </div>
    </div>
  );
}

export default EditableAchievementTask;
