import React from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import AchievementControlPanelTools from './AchievementControlPanelTools';

type EditableAchievementTaskProps = {
  achievementItems: { [id: number]: AchievementItem };
  setAchievementItems?: any;
  resetCurrentTasks: any;
  task: any;
  id: number;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { achievementItems, setAchievementItems, resetCurrentTasks, task, id } = props;

  /* Helpers to check validity of Prerequisites */

  const checkCyclicDependent = (taskID: number, prerreqIDs: number[] | undefined): boolean => {
    /*
      taskID: prerequisiteIDs
    */
    if (prerreqIDs === undefined) {
      return false;
    }

    for (let i = 0; i < prerreqIDs.length; i++) {
      const prereqID = prerreqIDs[i];
      if (taskID === prereqID) {
        return true;
      }

      if (checkCyclicDependent(taskID, achievementItems[prereqID].prerequisiteIds)) {
        return true;
      }
    }

    return false;
  };

  const isCyclicDependenent = (taskID: number, prereqID: number): boolean => {
    const clonedTaskPrereqIDs = Object.assign(
      [],
      achievementItems[taskID].prerequisiteIds === undefined
        ? []
        : achievementItems[taskID].prerequisiteIds
    );

    clonedTaskPrereqIDs.push(prereqID);

    return checkCyclicDependent(taskID, clonedTaskPrereqIDs);
  };

  /* Helpers to Retrieve Prerequisites */

  const mapPrerequisiteIDsToAchievements = (prereqIDs: number[] | undefined) => {
    return prereqIDs === undefined ? [] : prereqIDs.map(prereqId => achievementItems[prereqId]);
  };

  const getAllAchievementIDs = () => {
    return Object.values(achievementItems).map(achievement => achievement.id);
  };

  const getPrerequisiteIDs = () => {
    if (achievementItems[id] === undefined || achievementItems[id].prerequisiteIds === undefined) {
      return [];
    }

    return achievementItems[id].prerequisiteIds;
  };

  const getNonPrerequisitesIDs = () => {
    const prerequisiteIDs = getPrerequisiteIDs();
    const achievementIDs = getAllAchievementIDs();

    if (prerequisiteIDs === undefined) {
      return achievementIDs;
    }

    return achievementIDs
      .filter(achievementID => !prerequisiteIDs.includes(achievementID))
      .filter(achievementID => achievementID !== id)
      .filter(achievementID => !isCyclicDependenent(id, achievementID));
  };

  /* Functions to Modify Prerequisites */

  const addPrerequisite = (taskID: number, prereqID: number) => {
    if (achievementItems[prereqID] === undefined) {
      return;
    }

    if (achievementItems[taskID].prerequisiteIds === undefined) {
      achievementItems[taskID].prerequisiteIds = [];
    }

    if (achievementItems[taskID].prerequisiteIds?.includes(prereqID)) {
      return;
    }

    if (isCyclicDependenent(taskID, prereqID)) {
      return;
    }

    achievementItems[taskID].prerequisiteIds?.push(prereqID);
    setAchievementItems(achievementItems);
    resetCurrentTasks();
  };

  const deletePrerequisite = (taskID: number, prereqID: number) => {
    if (achievementItems[prereqID] === undefined) {
      return;
    }

    achievementItems[taskID].prerequisiteIds = achievementItems[taskID].prerequisiteIds?.filter(
      id => id !== prereqID
    );
    setAchievementItems(achievementItems);
    resetCurrentTasks();
  };

  const deleteTask = () => {
    achievementItems[id].isTask = false;
    achievementItems[id].prerequisiteIds = [];
    setAchievementItems(achievementItems);
    resetCurrentTasks();
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
