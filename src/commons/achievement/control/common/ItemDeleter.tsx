import { Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';

type ItemDeleterProps = {
  deleteItem: () => void;
};

function ItemDeleter(props: ItemDeleterProps) {
  const { deleteItem } = props;

  const handleConfirmDelete = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: 'Are you sure you want to delete?',
      positiveIntent: 'danger',
      positiveLabel: 'Yes, delete',
      negativeLabel: 'No'
    });
    if (confirm) {
      deleteItem();
    }
  };

  return (
    <Tooltip content="Delete">
      <Button icon={IconNames.TRASH} intent="danger" onClick={handleConfirmDelete} />
    </Tooltip>
  );
}

export default ItemDeleter;
