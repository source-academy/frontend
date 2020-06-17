import React, { useState } from 'react';
import { Dialog, Button, MenuItem, Classes } from '@blueprintjs/core';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { ItemRenderer, Select } from '@blueprintjs/select';

type AchievementControlPanelAdderProps = {
  toggleDialogFlag: any;
  addPrerequisite: any;
  flag: string;
  isDialogOpen: boolean;
  nonPrerequisites: AchievementItem[];
  taskID: number;
};

function AchievementControlPanelAdder(props: AchievementControlPanelAdderProps) {
  const { toggleDialogFlag, addPrerequisite, flag, nonPrerequisites, isDialogOpen, taskID } = props;

  const [addedPrerequisiteID, setAddedPrerequisiteID] = useState<number>(
    nonPrerequisites.length === 0 ? -1 : nonPrerequisites[0].id
  );

  const changeAddedPrerequisiteID = (prerequisiteID: number, e: any) => {
    setAddedPrerequisiteID(prerequisiteID);
  };

  const prerequisiteRenderer: ItemRenderer<number> = (item, { handleClick }) => {
    return <MenuItem active={false} key={item} onClick={handleClick} text={item} />;
  };

  const PrerequisiteSelectComponent = Select.ofType<number>();

  const prerequisiteSelector = (currentPrerequisiteID: number) => {
    return (
      <div>
        <Button className={Classes.MINIMAL} text={currentPrerequisiteID} />
      </div>
    );
  };

  const addingAction = (e: any) => {
    toggleDialogFlag(flag);
    addPrerequisite(taskID, addedPrerequisiteID);
  };

  return (
    <>
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag(flag)}
        text={'Add A Prerequisite'}
      />
      <Dialog onClose={() => toggleDialogFlag(flag)} isOpen={isDialogOpen} title="Add Prerequisite">
        <div>
          {nonPrerequisites.length === 0 ? (
            <p>You have no prerequisites to add!</p>
          ) : (
            <PrerequisiteSelectComponent
              className={Classes.MINIMAL}
              items={nonPrerequisites.map(item => item.id)}
              onItemSelect={changeAddedPrerequisiteID}
              itemRenderer={prerequisiteRenderer}
              filterable={false}
            >
              {prerequisiteSelector(addedPrerequisiteID)}
            </PrerequisiteSelectComponent>
          )}
        </div>

        <Button className="editor-button" onClick={addingAction} text={'Add'} />
      </Dialog>
    </>
  );
}

export default AchievementControlPanelAdder;
