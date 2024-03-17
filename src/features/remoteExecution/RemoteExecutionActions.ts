import { createAction } from '@reduxjs/toolkit';

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

export const remoteExecFetchDevices = createAction(REMOTE_EXEC_FETCH_DEVICES, () => ({
  payload: {}
}));

export const remoteExecUpdateDevices = createAction(
  REMOTE_EXEC_UPDATE_DEVICES,
  (devices: Device[]) => ({ payload: devices })
);

export const remoteExecUpdateSession = createAction(
  REMOTE_EXEC_UPDATE_SESSION,
  (session?: DeviceSession) => ({ payload: session })
);

export const remoteExecConnect = createAction(
  REMOTE_EXEC_CONNECT,
  (workspace: WorkspaceLocation, device: Device) => ({ payload: { workspace, device } })
);

export const remoteExecDisconnect = createAction(REMOTE_EXEC_DISCONNECT, () => ({ payload: {} }));

export const remoteExecRun = createAction(
  REMOTE_EXEC_RUN,
  (files: Record<string, string>, entrypointFilePath: string) => ({
    payload: { files, entrypointFilePath }
  })
);

export const remoteExecReplInput = createAction(REMOTE_EXEC_REPL_INPUT, (input: string) => ({
  payload: input
}));
