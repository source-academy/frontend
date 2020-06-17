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

  const getPrerequisiteTitle = (id: number) => {
    return prerequisites.find(item => item.id === id)?.title;
  };

  const changeDeletedPrerequisiteID = (prerequisiteID: number, e: any) => {
    setDeletedPrerequisiteID(prerequisiteID);
  };

  const prerequisiteRenderer: ItemRenderer<number> = (id, { handleClick }) => {
    return (
      <MenuItem
        active={false}
        key={id}
        onClick={handleClick}
        text={`${id} ${getPrerequisiteTitle(id)}`}
      />
    );
  };

  const PrerequisiteSelectComponent = Select.ofType<number>();

  const prerequisiteSelector = (currentPrerequisiteID: number) => {
    return (
      <div>
        <Button
          className={Classes.MINIMAL}
          text={`${currentPrerequisiteID} ${getPrerequisiteTitle(currentPrerequisiteID)}`}
        />
      </div>
    );
  };

  const deleteAction = (e: any) => {
    toggleDialogFlag(flag);
    deletePrerequisite(taskID, deletedPrerequisiteID);
    setDeletedPrerequisiteID(prerequisites.length === 0 ? -1 : prerequisites[0].id);
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
        {prerequisites.length === 0 ? (
          <div>
            <p>You have no prerequisites to delete!</p>
          </div>
        ) : (
          <>
            <div>
              <PrerequisiteSelectComponent
                className={Classes.MINIMAL}
                items={prerequisites.map(item => item.id)}
                onItemSelect={changeDeletedPrerequisiteID}
                itemRenderer={prerequisiteRenderer}
                filterable={false}
              >
                {prerequisiteSelector(deletedPrerequisiteID)}
              </PrerequisiteSelectComponent>
            </div>
            <Button className="editor-button" onClick={deleteAction} text={'Delete'} />
          </>
        )}
      </Dialog>
    </>
  );
}

export default AchievementControlPanelDeleter;
