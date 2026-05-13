import { createActions } from 'src/commons/redux/utils';

import type { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import type { Device, DeviceSession } from './RemoteExecutionTypes';

const RemoteExecutionActions = createActions('remoteExecution', {
  remoteExecFetchDevices: () => ({}),
  remoteExecUpdateDevices: (devices: Device[]) => devices,
  remoteExecUpdateSession: (session?: DeviceSession) => session,
  remoteExecConnect: (workspace: WorkspaceLocation, device: Device) => ({ workspace, device }),
  remoteExecDisconnect: () => ({}),
  remoteExecRun: (files: Record<string, string>, entrypointFilePath: string) => ({
    files,
    entrypointFilePath
  }),
  remoteExecReplInput: (input: string) => input
});

// For compatibility with existing code (actions helper)
export default RemoteExecutionActions;
