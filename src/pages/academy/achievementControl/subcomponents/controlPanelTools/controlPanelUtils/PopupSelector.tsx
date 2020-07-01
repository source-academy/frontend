import React from 'react';

import { ItemRenderer, Select } from '@blueprintjs/select';
import { MenuItem, Button, Classes, Dialog } from '@blueprintjs/core';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type PopupSelectorProps = {
  selectionIds: number[];
  inferencer: Inferencer;
  dialogHeader: string;
  focusId: number;
  setFocusId: any;
  buttonText: string;
  emptySelectionMessage: string;
  isDialogOpen: boolean;
  toggleDialogOpen: any;
  action: (e: any) => void;
};

function PopupSelector(props: PopupSelectorProps) {
  const {
    selectionIds,
    inferencer,
    dialogHeader,
    focusId,
    setFocusId,
    buttonText,
    emptySelectionMessage,
    isDialogOpen,
    toggleDialogOpen,
    action
  } = props;

  const getAchievementTitle = (id: number) => {
    if (!inferencer.doesAchievementExist(id)) {
      return 'Please Select an Item';
    }

    return inferencer.getAchievementItem(id).title;
  };

  const changeFocusId = (taskID: number, e: any) => {
    setFocusId(taskID);
  };

  const taskRenderer: ItemRenderer<number> = (id, { handleClick }) => {
    return (
      <MenuItem active={false} key={id} onClick={handleClick} text={getAchievementTitle(id)} />
    );
  };

  const TaskSelectComponent = Select.ofType<number>();

  const taskSelector = (currentPrerequisiteID: number) => {
    return (
      <div>
        <Button className={Classes.MINIMAL} text={getAchievementTitle(currentPrerequisiteID)} />
      </div>
    );
  };

  return (
    <>
      <Dialog
        onClose={toggleDialogOpen}
        className={'task-selector'}
        isOpen={isDialogOpen}
        title={dialogHeader}
      >
        <div className={Classes.DIALOG_BODY}>
          {selectionIds.length === 0 ? (
            <div className="task-selector">
              <p>{emptySelectionMessage}</p>
            </div>
          ) : (
            <>
              <div className="task-selector">
                <div>
                  <TaskSelectComponent
                    items={selectionIds}
                    onItemSelect={changeFocusId}
                    itemRenderer={taskRenderer}
                    filterable={false}
                  >
                    {taskSelector(focusId)}
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

export default PopupSelector;
