import React, { useState } from 'react';
import { Dialog, Button, MenuItem, Classes } from '@blueprintjs/core';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';
import { ItemRenderer, Select } from '@blueprintjs/select';

type AchievementControlPanelDeleterProps = {
  toggleDialogFlag: any;
  deletePrerequisite: any;
  flag: string;
  isDialogOpen: boolean;
  prerequisites: AchievementItem[];
  taskID: number;
};

function AchievementControlPanelDeleter(props: AchievementControlPanelDeleterProps) {
  const { toggleDialogFlag, deletePrerequisite, flag, isDialogOpen, prerequisites, taskID } = props;

  const [deletedPrerequisiteID, setDeletedPrerequisiteID] = useState<number>(
    prerequisites.length === 0 ? -1 : prerequisites[0].id
  );

  const changeDeletedPrerequisiteID = (prerequisiteID: number, e: any) => {
    setDeletedPrerequisiteID(prerequisiteID);
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

  const deleteAction = (e: any) => {
    toggleDialogFlag(flag);
    deletePrerequisite(taskID, deletedPrerequisiteID);
  };

  return (
    <>
      <Button
        className="editor-button"
        onClick={() => toggleDialogFlag(flag)}
        text={'Delete A Prerequisite'}
      />
      <Dialog
        onClose={() => toggleDialogFlag(flag)}
        isOpen={isDialogOpen}
        title="Delete Prerequisite"
      >
        <div>
          {prerequisites.length === 0 ? (
            <p>You have no prerequisites to delete!</p>
          ) : (
            <PrerequisiteSelectComponent
              className={Classes.MINIMAL}
              items={prerequisites.map(item => item.id)}
              onItemSelect={changeDeletedPrerequisiteID}
              itemRenderer={prerequisiteRenderer}
              filterable={false}
            >
              {prerequisiteSelector(deletedPrerequisiteID)}
            </PrerequisiteSelectComponent>
          )}
        </div>

        <Button className="editor-button" onClick={deleteAction} text={'Delete'} />
      </Dialog>
    </>
  );
}

export default AchievementControlPanelDeleter;
