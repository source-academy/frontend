import React, { useState } from 'react';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { MenuItem, Button, Classes, Dialog } from '@blueprintjs/core';

export type AchievementControlPanelTaskAdderProps = {
  achievementItems: { [id: number]: AchievementItem };
  setAchievementItems: any;
  resetCurrentTasks: any;
  pendingTasks: AchievementItem[];
};

function AchievementControlPanelTaskAdder(props: AchievementControlPanelTaskAdderProps) {
  const { achievementItems, setAchievementItems, resetCurrentTasks, pendingTasks } = props;

  const [addedTaskID, setAddedTaskID] = useState<number>(
    pendingTasks.length === 0 ? -1 : pendingTasks[0].id
  );

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const getTaskTitle = (id: number) => {
    return pendingTasks.find(item => item.id === id)?.title;
  };

  const changeAddedTaskID = (prerequisiteID: number, e: any) => {
    setAddedTaskID(prerequisiteID);
  };

  const taskRenderer: ItemRenderer<number> = (id, { handleClick }) => {
    return (
      <MenuItem active={false} key={id} onClick={handleClick} text={`${id} ${getTaskTitle(id)}`} />
    );
  };

  const TaskSelectComponent = Select.ofType<number>();

  const taskSelector = (currentPrerequisiteID: number) => {
    return (
      <div>
        <Button
          className={Classes.MINIMAL}
          text={`${currentPrerequisiteID} ${getTaskTitle(currentPrerequisiteID)}`}
        />
      </div>
    );
  };

  const setTaskState = (taskID: number) => {
    achievementItems[taskID].isTask = true;
    setAchievementItems(achievementItems);
  };

  const addingAction = (e: any) => {
    setDialogOpen(!isDialogOpen);
    setTaskState(addedTaskID);
    resetCurrentTasks();
    setAddedTaskID(pendingTasks.length === 0 ? -1 : pendingTasks[0].id);
  };

  return (
    <>
      <Button
        className="main-adder"
        onClick={() => setDialogOpen(!isDialogOpen)}
        text={'Add A Task'}
      />
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title="Add A New Task"
      >
        {pendingTasks.length === 0 ? (
          <div>
            <p>You have no prerequisites to delete!</p>
          </div>
        ) : (
          <>
            <div>
              <TaskSelectComponent
                className={Classes.MINIMAL}
                items={pendingTasks.map(item => item.id)}
                onItemSelect={changeAddedTaskID}
                itemRenderer={taskRenderer}
                filterable={false}
              >
                {taskSelector(addedTaskID)}
              </TaskSelectComponent>
            </div>
            <Button className="editor-button" onClick={addingAction} text={'Add'} />
          </>
        )}
      </Dialog>
    </>
  );
}

export default AchievementControlPanelTaskAdder;
