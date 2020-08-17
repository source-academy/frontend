import { Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';

type ItemDeleterProps = {
  handleDelete: () => void;
  item: string;
};

function ItemDeleter(props: ItemDeleterProps) {
  const { handleDelete, item } = props;

  const handleConfirmDelete = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: `Are you sure you want to delete '${item}' ?`,
      negativeLabel: 'No',
      positiveIntent: 'danger',
      positiveLabel: 'Yes, delete'
    });
    if (confirm) {
      handleDelete();
    }
  };

  return (
    <Tooltip content="Delete">
      <Button icon={IconNames.TRASH} intent="danger" onClick={handleConfirmDelete} />
    </Tooltip>
  );
}

export default ItemDeleter;
