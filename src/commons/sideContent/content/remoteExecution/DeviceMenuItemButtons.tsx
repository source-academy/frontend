import { Button } from '@blueprintjs/core';
import React from 'react';

type Props = {
  text?: React.ReactNode;
  handleDelete: React.MouseEventHandler;
  handleEdit: React.MouseEventHandler;
};

const DeviceMenuItemButtons: React.FC<Props> = ({ text, handleDelete, handleEdit }) => {
  return (
    <>
      {text}
      <div className="edit-buttons">
        <Button
          small
          minimal
          icon="edit"
          onClick={e => {
            e.stopPropagation();
            handleEdit(e);
          }}
        />
        <Button
          small
          minimal
          intent="danger"
          icon="trash"
          onClick={e => {
            e.stopPropagation();
            handleDelete(e);
          }}
        />
      </div>
    </>
  );
};

export default DeviceMenuItemButtons;
