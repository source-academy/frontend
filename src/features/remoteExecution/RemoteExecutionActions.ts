import { action } from 'typesafe-actions';

import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import {
  Device,
  DeviceSession,
  REMOTE_EXEC_CONNECT,
  REMOTE_EXEC_DISCONNECT,
  REMOTE_EXEC_FETCH_DEVICES,
  REMOTE_EXEC_REPL_INPUT,
  REMOTE_EXEC_RUN,
  REMOTE_EXEC_UPDATE_DEVICES,
  REMOTE_EXEC_UPDATE_SESSION
} from './RemoteExecutionTypes';

export const remoteExecFetchDevices = () => action(REMOTE_EXEC_FETCH_DEVICES);

export const remoteExecUpdateDevices = (devices: Device[]) =>
  action(REMOTE_EXEC_UPDATE_DEVICES, devices);

export const remoteExecUpdateSession = (session?: DeviceSession) =>
  action(REMOTE_EXEC_UPDATE_SESSION, session);

export const remoteExecConnect = (workspace: WorkspaceLocation, device: Device) =>
  action(REMOTE_EXEC_CONNECT, { workspace, device });

export const remoteExecDisconnect = () => action(REMOTE_EXEC_DISCONNECT);

export const remoteExecRun = (program: string) => action(REMOTE_EXEC_RUN, program);

export const remoteExecReplInput = (input: string) => action(REMOTE_EXEC_REPL_INPUT, input);
