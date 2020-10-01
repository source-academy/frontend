import { SlingClient } from '@sourceacademy/sling-client';

import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';

export const REMOTE_EXEC_FETCH_DEVICES = 'REMOTE_EXEC_FETCH_DEVICES';
export const REMOTE_EXEC_UPDATE_DEVICES = 'REMOTE_EXEC_UPDATE_DEVICES';
export const REMOTE_EXEC_UPDATE_SESSION = 'REMOTE_EXEC_UPDATE_SESSION';

export const REMOTE_EXEC_CONNECT = 'REMOTE_EXEC_CONNECT';
export const REMOTE_EXEC_DISCONNECT = 'REMOTE_EXEC_DISCONNECT';

export const REMOTE_EXEC_RUN = 'REMOTE_EXEC_RUN';
export const REMOTE_EXEC_REPL_INPUT = 'REMOTE_EXEC_REPL_INPUT';

export interface Device {
  id: number;
  title: string;
  secret: string;
  type: string;
}

export interface WebSocketEndpointInformation {
  endpoint: string;
  clientNamePrefix: string;
  thingName: string;
}

export type DeviceConnection =
  | { status: 'CONNECTING'; client: SlingClient; endpoint: WebSocketEndpointInformation }
  | { status: 'CONNECTED'; client: SlingClient; endpoint: WebSocketEndpointInformation }
  | { status: 'FAILED'; error?: string; client?: SlingClient };

export interface DeviceSession {
  workspace: WorkspaceLocation;
  device: Device;
  connection: DeviceConnection;
}

export interface DeviceType {
  id: string;
  name: string;
  internalFunctions: string[];
}

export const deviceTypes: DeviceType[] = [
  {
    id: 'EV3',
    name: 'Lego Mindstorms EV3',
    // This list must be in the same order as the list here:
    // https://github.com/source-academy/sinter/blob/ev3/devices/ev3/src/ev3_functions.c#L652
    internalFunctions: [
      'ev3_pause',
      'ev3_connected',
      'ev3_motorA',
      'ev3_motorB',
      'ev3_motorC',
      'ev3_motorD',
      'ev3_motorGetSpeed',
      'ev3_motorSetSpeed',
      'ev3_motorStart',
      'ev3_motorStop',
      'ev3_motorSetStopAction',
      'ev3_motorGetPosition',
      'ev3_runForTime',
      'ev3_runToAbsolutePosition',
      'ev3_runToRelativePosition',
      'ev3_colorSensor',
      'ev3_colorSensorRed',
      'ev3_colorSensorGreen',
      'ev3_colorSensorBlue',
      'ev3_reflectedLightIntensity',
      'ev3_ambientLightIntensity',
      'ev3_colorSensorGetColor',
      'ev3_ultrasonicSensor',
      'ev3_ultrasonicSensorDistance',
      'ev3_gyroSensor',
      'ev3_gyroSensorAngle',
      'ev3_gyroSensorRate',
      'ev3_touchSensor1',
      'ev3_touchSensor2',
      'ev3_touchSensor3',
      'ev3_touchSensor4',
      'ev3_touchSensorPressed',
      'ev3_hello',
      'ev3_waitForButtonPress',
      'ev3_speak',
      'ev3_playSequence'
    ]
  }
];

export const deviceTypesById: Map<string, DeviceType> = new Map(
  deviceTypes.map(type => [type.id, type])
);
