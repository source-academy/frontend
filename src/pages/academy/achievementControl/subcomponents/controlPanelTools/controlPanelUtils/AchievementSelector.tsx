import { Button, Classes, Dialog, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React from 'react';

import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';

type AchievementSelectorProps = {
  inferencer: Inferencer;
  dialogHeader: string;
  selections: number[];
  selectedId: number;
  setSelectedId: any;
  buttonText: string;
  emptySelectionsMessage: string;
  action: any;
  isDialogOpen: boolean;
  toggleDialogOpen: any;
};

function AchievementSelector(props: AchievementSelectorProps) {
  const {
    inferencer,
    dialogHeader,
    selections,
    selectedId,
    setSelectedId,
    buttonText,
    emptySelectionsMessage,
    action,
    isDialogOpen,
    toggleDialogOpen
  } = props;

  let shouldDisabledAction = false;

  const getAchievementTitle = (id: number) => {
    if (!inferencer.doesAchievementExist(id)) {
      shouldDisabledAction = true;
      return 'Please Select an Item';
    }
    return inferencer.getAchievementItem(id).title;
  };

  const changeSelectedId = (selectedId: number) => {
    setSelectedId(selectedId);
  };

  const selectionsRenderer: ItemRenderer<number> = (id, { handleClick }) => {
    return (
      <MenuItem active={false} key={id} onClick={handleClick} text={getAchievementTitle(id)} />
    );
  };

  const SelectionsComponent = Select.ofType<number>();

  const selectButton = (currentPrerequisiteID: number) => {
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
          {selections.length === 0 ? (
            <div className="task-selector">
              <p>{emptySelectionsMessage}</p>
            </div>
          ) : (
            <>
              <div className="task-selector">
                <div>
                  <SelectionsComponent
                    items={selections}
                    onItemSelect={changeSelectedId}
                    itemRenderer={selectionsRenderer}
                    filterable={false}
                  >
                    {selectButton(selectedId)}
                  </SelectionsComponent>
                </div>
                <div>
                  <Button
                    className="editor-button"
                    onClick={action}
                    text={buttonText}
                    disabled={shouldDisabledAction}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}

export default AchievementSelector;
