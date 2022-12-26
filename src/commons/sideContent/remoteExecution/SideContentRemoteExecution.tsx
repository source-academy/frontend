import {
  Callout,
  Classes,
  Menu,
  MenuDivider,
  MenuItem,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import classNames from 'classnames';
import React, { SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import BrickSvg from 'src/assets/BrickSvg';
import PortSvg from 'src/assets/PortSvg';
import PeripheralContainer from 'src/features/remoteExecution/PeripheralContainer';
import RemoteExecutionAddDeviceDialog from 'src/features/remoteExecution/RemoteExecutionDeviceDialog';
import {
  ev3PeripheralToComponentMap,
  ev3SensorModeToValueTransformerMap
} from 'src/features/remoteExecution/RemoteExecutionEv3Types';
import { Device, DeviceSession } from 'src/features/remoteExecution/RemoteExecutionTypes';

import { actions } from '../../utils/ActionsHelper';
import { useTypedSelector } from '../../utils/Hooks';
import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import DeviceMenuItemButtons from './DeviceMenuItemButtons';

export interface SideContentRemoteExecutionProps {
  workspace: WorkspaceLocation;
  secretParams?: string;
  callbackFunction?: React.Dispatch<SetStateAction<string | undefined>>;
}

const DeviceContent = ({ session }: { session?: DeviceSession }) => {
  if (!session) {
    return (
      <>
        <p>Not connected to a device&mdash;programs are run in your local browser.</p>
        <p>Select a device from the right.</p>
      </>
    );
  }
  const { device, connection } = session;
  switch (connection.status) {
    case 'CONNECTED':
      return (
        <p>
          Connected to {device.title} ({device.type}).
        </p>
      );
    case 'CONNECTING':
      return <NonIdealState description="Connecting..." icon={<Spinner />} />;
    default:
    case 'FAILED':
      return (
        <Callout intent="danger">
          Could not connect to {device.title}: {connection.error || 'unknown error'}
        </Callout>
      );
  }
};

const motorPorts = ['portA', 'portB', 'portC', 'portD'] as const;
const sensorPorts = ['port1', 'port2', 'port3', 'port4'] as const;

const SideContentRemoteExecution: React.FC<SideContentRemoteExecutionProps> = props => {
  const [dialogState, setDialogState] = React.useState<Device | true | undefined>(
    props.secretParams ? true : undefined
  );
  const [secretParams, setSecretParams] = React.useState(props.secretParams);

  const isLoggedIn = useTypedSelector(state => !!state.session.accessToken && !!state.session.role);
  const devices = useTypedSelector(state => state.session.remoteExecutionDevices);
  const currentSession = useTypedSelector(state => state.session.remoteExecutionSession);
  const dispatch = useDispatch();

  const isConnected = currentSession?.connection.status === 'CONNECTED';

  React.useEffect(() => {
    // this is not supposed to happen - the destructor below should disconnect
    // once the user navigates away from the workspace
    if (currentSession && currentSession.workspace !== props.workspace) {
      dispatch(
        actions.remoteExecUpdateSession({
          ...currentSession,
          workspace: props.workspace
        })
      );
    }
  }, [currentSession, dispatch, props.workspace]);

  React.useEffect(() => {
    if (!devices && isLoggedIn) {
      dispatch(actions.remoteExecFetchDevices());
    }
  }, [dispatch, devices, isLoggedIn]);

  React.useEffect(
    () => () => {
      // note the double () => - this function is a destructor
      dispatch(actions.remoteExecDisconnect());
    },
    [dispatch]
  );

  if (!isLoggedIn) {
    return (
      <Callout intent="danger">
        Please <NavLink to="/login">log in</NavLink> to execute on a remote device.
      </Callout>
    );
  }

  const currentDevice = currentSession?.device;

  return (
    <>
      <div className="sa-remote-execution row">
        <div className="col-xs-6">
          <DeviceContent session={currentSession} />
        </div>
        <div className="col-xs-6 devices-menu-container">
          <Menu className={classNames(Classes.ELEVATION_0)}>
            <MenuItem
              text="Browser"
              onClick={() => dispatch(actions.remoteExecDisconnect())}
              icon={!currentDevice ? 'tick' : undefined}
              intent={!currentDevice ? 'success' : undefined}
            />
            {devices &&
              devices.map(device => {
                const thisDevice = currentDevice?.id === device.id;
                return (
                  <MenuItem
                    key={device.id}
                    onClick={() => dispatch(actions.remoteExecConnect(props.workspace, device))}
                    text={`${device.title} (${device.type})`}
                    icon={thisDevice ? 'tick' : undefined}
                    labelElement={
                      <DeviceMenuItemButtons
                        onEditDevice={setDialogState}
                        isConnected={thisDevice && isConnected}
                        device={device}
                        dispatch={dispatch}
                      />
                    }
                    intent={thisDevice && isConnected ? 'success' : undefined}
                  />
                );
              })}
            <MenuDivider />
            <MenuItem text="Add new device..." icon="add" onClick={() => setDialogState(true)} />
          </Menu>
        </div>
        <RemoteExecutionAddDeviceDialog
          isOpen={!!dialogState}
          deviceToEdit={typeof dialogState === 'object' ? dialogState : undefined}
          defaultSecret={dialogState === true ? secretParams : undefined}
          onClose={() => {
            setDialogState(undefined);
            setSecretParams(undefined);
            if (props.callbackFunction) {
              props.callbackFunction(undefined);
            }
          }}
        />
      </div>
      {isConnected && currentDevice && currentDevice.peripherals && (
        <div>
          <div
            style={{
              textAlign: 'center',
              maxWidth: 480,
              marginInline: 'auto',
              marginBlock: '2rem'
            }}
          >
            <div className="sa-remote-execution row">
              {motorPorts.map(port => {
                const portData = currentDevice.peripherals?.[port];
                return portData ? (
                  <PeripheralContainer
                    src={ev3PeripheralToComponentMap[portData.type]}
                    text={`Speed: ${portData.speed}°/s\nPosition: ${portData.position}°`}
                  />
                ) : (
                  <PeripheralContainer src={<PortSvg port={port.substring(port.length - 1)} />} />
                );
              })}
            </div>
            <BrickSvg />
            <div className="sa-remote-execution row">
              {sensorPorts.map(port => {
                const portData = currentDevice.peripherals?.[port];
                return portData ? (
                  <PeripheralContainer
                    src={ev3PeripheralToComponentMap[portData.type]}
                    text={ev3SensorModeToValueTransformerMap[portData.mode](portData.value)}
                  />
                ) : (
                  <PeripheralContainer src={<PortSvg port={port.substring(port.length - 1)} />} />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideContentRemoteExecution;
