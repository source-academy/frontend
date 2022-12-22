import { Button } from '@blueprintjs/core';
import React from 'react';
import { Dispatch } from 'redux';
import { deleteDevice } from 'src/commons/sagas/RequestsSaga';
import { actions } from 'src/commons/utils/ActionsHelper';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';
import { Device } from 'src/features/remoteExecution/RemoteExecutionTypes';

type DeviceMenuItemProps = {
  isConnected: boolean;
  device: Device;
  dispatch: Dispatch;
  onEditDevice: (device: Device) => void;
};

const DeviceMenuItemButtons: React.FC<DeviceMenuItemProps> = ({
  isConnected,
  device,
  dispatch,
  onEditDevice
}) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = await showSimpleConfirmDialog({
      title: 'Really delete device?',
      contents: `Are you sure you want to delete ${device.title} (${device.type})?`,
      positiveLabel: 'Delete',
      positiveIntent: 'danger',
      negativeLabel: 'No',
      icon: 'trash'
    });
    if (!confirm) {
      return;
    }
    try {
      await deleteDevice(device);
    } catch (e) {
      showWarningMessage(e.message || 'Unknown error occurred.');
      return;
    }
    if (isConnected) {
      dispatch(actions.remoteExecDisconnect());
    }
    dispatch(actions.remoteExecFetchDevices());
  };

  return (
    <>
      {isConnected && <>Connected</>}
      <div className="edit-buttons">
        <Button
          small
          minimal
          icon="edit"
          onClick={e => {
            e.stopPropagation();
            onEditDevice(device);
          }}
        />
        <Button small minimal intent="danger" icon="trash" onClick={handleDelete} />
      </div>
    </>
  );
};

export default DeviceMenuItemButtons;
