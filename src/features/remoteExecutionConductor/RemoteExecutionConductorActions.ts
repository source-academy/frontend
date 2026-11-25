import { createActions } from 'src/commons/redux/utils';

const RemoteExecutionConductorActions = createActions('remoteExecutionConductor', {
  remoteExecConductorDisconnect: () => ({}),
  remoteExecConductorRun: (files: Record<string, string>, entrypointFilePath: string) => ({
    files,
    entrypointFilePath,
  }),
});

export default RemoteExecutionConductorActions;
