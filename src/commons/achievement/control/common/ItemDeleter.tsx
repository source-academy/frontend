import { Button, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';

type ItemDeleterProps = {
  deleteItem: any;
};

function ItemDeleter(props: ItemDeleterProps) {
  const { deleteItem } = props;

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  return (
    <div className="deleter">
      <Button text="Delete" icon={IconNames.TRASH} intent="danger" onClick={toggleOpen} />
      <Dialog title="Confirm Delete" isOpen={isOpen} onClose={toggleOpen}>
        <p> Are you sure you want to delete this item?</p>

        <Button text="Delete" className="editor-button" intent="danger" onClick={deleteItem} />
      </Dialog>
    </div>
  );
}

export default ItemDeleter;
