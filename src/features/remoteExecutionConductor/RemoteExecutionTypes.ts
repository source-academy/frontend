import type { DeviceSession } from '../remoteExecution/RemoteExecutionTypes';

// The result of EV3Engine.execute() from py-slang
export type Ev3ConductorExecutionResult =
  | { status: 'finished'; output: string }   // output = JSON-stringified SVML
  | { status: 'error'; error: string };

// Session state for the conductor-based EV3 connection
export interface ConductorDeviceSession extends DeviceSession {
  isConductor: true;
}
