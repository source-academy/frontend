import { Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';

type ItemDeleterProps = {
  item: string;
  handleDelete: () => void;
};

function ItemDeleter(props: ItemDeleterProps) {
  const { item, handleDelete } = props;

  const handleConfirmDelete = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: `Are you sure you want to delete '${item}' ?`,
      positiveIntent: 'danger',
      positiveLabel: 'Yes, delete',
      negativeLabel: 'No'
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
