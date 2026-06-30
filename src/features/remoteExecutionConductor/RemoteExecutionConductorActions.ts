import { createActions } from 'src/commons/redux/utils';
import type { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import type { Device, DeviceSession } from '../remoteExecution/RemoteExecutionTypes';

const RemoteExecutionConductorActions = createActions('remoteExecutionConductor', {
  remoteExecConductorConnect: (workspace: WorkspaceLocation, device: Device) => ({
    workspace,
    device,
  }),
  remoteExecConductorDisconnect: () => ({}),
  remoteExecConductorUpdateSession: (session?: DeviceSession) => session,
  remoteExecConductorRun: (files: Record<string, string>, entrypointFilePath: string) => ({
    files,
    entrypointFilePath,
  }),
});

export default RemoteExecutionConductorActions;
