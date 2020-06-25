import React from 'react';

import { ItemRenderer, Select } from '@blueprintjs/select';
import { MenuItem, Button, Classes, Dialog } from '@blueprintjs/core';
import Inferencer from 'src/pages/academy/achievements/subcomponents/utils/Inferencer';

type AchievementTaskSelectProps = {
  tasks: number[];
  inferencer: Inferencer;
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
    inferencer,
    focusTaskID,
    buttonText,
    dialogHeader,
    emptyTasksMessage,
    setDialogOpen,
    isDialogOpen,
    action,
    setFocusTaskID
  } = props;

  const getTaskTitle = (id: number) => {
    return inferencer.getAchievementItem(id).title;
  };

  const changeFocusTaskID = (taskID: number, e: any) => {
    setFocusTaskID(taskID);
  };

  const taskRenderer: ItemRenderer<number> = (id, { handleClick }) => {
    return <MenuItem active={false} key={id} onClick={handleClick} text={getTaskTitle(id)} />;
  };

  const TaskSelectComponent = Select.ofType<number>();

  const taskSelector = (currentPrerequisiteID: number) => {
    return (
      <div>
        <Button className={Classes.MINIMAL} text={getTaskTitle(currentPrerequisiteID)} />
      </div>
    );
  };

  return (
    <>
      <Dialog
        onClose={setDialogOpen}
        className={'task-selector'}
        isOpen={isDialogOpen}
        title={dialogHeader}
      >
        <div className={Classes.DIALOG_BODY}>
          {tasks.length === 0 ? (
            <div className="task-selector">
              <p>{emptyTasksMessage}</p>
            </div>
          ) : (
            <>
              <div className="task-selector">
                <div>
                  <TaskSelectComponent
                    items={tasks}
                    onItemSelect={changeFocusTaskID}
                    itemRenderer={taskRenderer}
                    filterable={false}
                  >
                    {taskSelector(focusTaskID)}
                  </TaskSelectComponent>
                </div>
                <div>
                  <Button className="editor-button" onClick={action} text={buttonText} />
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}

export default AchievementTaskSelect;
