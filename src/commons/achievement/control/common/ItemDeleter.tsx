import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';

type ItemDeleterProps = {
  deleteItem: () => void;
  item: string;
};

const ItemDeleter: React.FC<ItemDeleterProps> = ({ deleteItem, item }) => {
  const confirmDelete = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: `Are you sure you want to delete '${item}' ?`,
      negativeLabel: 'No',
      positiveIntent: 'danger',
      positiveLabel: 'Yes, delete'
    });
    if (confirm) {
      deleteItem();
    }
  };

  return (
    <Tooltip2 content="Delete">
      <Button icon={IconNames.TRASH} intent="danger" onClick={confirmDelete} />
    </Tooltip2>
  );
};

export default ItemDeleter;
