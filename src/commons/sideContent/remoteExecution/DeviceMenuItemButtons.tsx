import { Button } from '@blueprintjs/core';
import React from 'react';

type DeviceMenuItemProps = {
  text?: React.ReactNode;
  handleDelete: () => void;
  handleEdit: () => void;
};

const DeviceMenuItemButtons: React.FC<DeviceMenuItemProps> = ({
  text,
  handleDelete,
  handleEdit
}) => {
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
            handleEdit();
          }}
        />
        <Button
          small
          minimal
          intent="danger"
          icon="trash"
          onClick={e => {
            e.stopPropagation();
            handleDelete();
          }}
        />
      </div>
    </>
  );
};

export default DeviceMenuItemButtons;
