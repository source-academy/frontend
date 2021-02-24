import { Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';

type ItemDeleterProps = {
  deleteItem: () => void;
  item: string;
};

function ItemDeleter(props: ItemDeleterProps) {
  const { deleteItem, item } = props;

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
    <Tooltip content="Delete">
      <Button icon={IconNames.TRASH} intent="danger" onClick={confirmDelete} />
    </Tooltip>
  );
}

export default ItemDeleter;
