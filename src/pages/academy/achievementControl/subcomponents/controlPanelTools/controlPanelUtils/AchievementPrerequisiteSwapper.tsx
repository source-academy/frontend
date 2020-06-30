import React from 'react';

import { ItemRenderer, Select } from '@blueprintjs/select';
import { MenuItem, Button, Classes, Dialog } from '@blueprintjs/core';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type AchievementPrerequisiteSwapperProps = {
  prerequisiteIdDs: number[];
  inferencer: Inferencer;

  setDialogOpen: any;
  isDialogOpen: boolean;
  action: (e: any) => void;

  firstID: number;
  setFirstID: any;
  secondID: number;
  setSecondID: any;
};

function AchievementPrerequisiteSwapper(props: AchievementPrerequisiteSwapperProps) {
  const {
    prerequisiteIdDs,
    inferencer,
    setDialogOpen,
    isDialogOpen,
    action,
    firstID,
    setFirstID,
    secondID,
    setSecondID
  } = props;

  const getTaskTitle = (id: number) => {
    if (!inferencer.doesAchievementExist(id)) {
      return 'Please Select an Item';
    }

    return inferencer.getAchievementItem(id).title;
  };

  const changeFocusTaskID = (taskID: number, e: any) => {
    setFirstID(taskID);
  };

  const changeSecondFocusTaskID = (taskID: number, e: any) => {
    setSecondID(taskID);
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
        title={'Swap'}
      >
        <div className={Classes.DIALOG_BODY}>
          {prerequisiteIdDs.length === 0 ? (
            <div className="task-selector">
              <p>Add a prerequisite to continue</p>
            </div>
          ) : (
            <>
              <div className="task-selector">
                <div>
                  <TaskSelectComponent
                    items={prerequisiteIdDs}
                    onItemSelect={changeFocusTaskID}
                    itemRenderer={taskRenderer}
                    filterable={false}
                  >
                    {taskSelector(firstID)}
                  </TaskSelectComponent>
                </div>

                <div>
                  <TaskSelectComponent
                    items={prerequisiteIdDs}
                    onItemSelect={changeSecondFocusTaskID}
                    itemRenderer={taskRenderer}
                    filterable={false}
                  >
                    {taskSelector(secondID)}
                  </TaskSelectComponent>
                </div>

                <div>
                  <Button className="editor-button" onClick={action} text={'swap'} />
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}

export default AchievementPrerequisiteSwapper;
