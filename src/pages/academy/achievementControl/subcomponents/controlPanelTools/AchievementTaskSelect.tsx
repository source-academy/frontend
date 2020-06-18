import React from 'react';

import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { MenuItem, Button, Classes, Dialog } from '@blueprintjs/core';

type AchievementTaskSelectProps = {
  tasks: AchievementItem[];
  focusTaskID: number;
  buttonText: string;
  dialogHeader: string;

  emptyTasksMessage: string;

  setDialogOpen: any;
  isDialogOpen: boolean;
  action: (e: any) => void;
  setFocusTaskID: any;
};

function AchievementTaskSelect(props: AchievementTaskSelectProps) {
  const {
    tasks,
    focusTaskID,
    buttonText,
    dialogHeader,
    emptyTasksMessage,
    setDialogOpen,
    isDialogOpen,
    action,
    setFocusTaskID
  } = props;

  const taskIDs = tasks.map(item => item.id);

  const getTaskTitle = (id: number) => {
    return tasks.find(item => item.id === id)?.title;
  };

  const changeFocusTaskID = (taskID: number, e: any) => {
    setFocusTaskID(taskID);
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

  return (
    <>
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title={dialogHeader}
      >
        {tasks.length === 0 ? (
          <div>
            <p>{emptyTasksMessage}</p>
          </div>
        ) : (
          <>
            <div>
              <TaskSelectComponent
                className={Classes.MINIMAL}
                items={taskIDs}
                onItemSelect={changeFocusTaskID}
                itemRenderer={taskRenderer}
                filterable={false}
              >
                {taskSelector(focusTaskID)}
              </TaskSelectComponent>
            </div>
            <Button className="editor-button" onClick={action} text={buttonText} />
          </>
        )}
      </Dialog>
    </>
  );
}

export default AchievementTaskSelect;
