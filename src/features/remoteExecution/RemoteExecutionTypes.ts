import { SlingClient } from '@sourceacademy/sling-client';
import { Chapter } from 'js-slang/dist/types';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

import { Ev3DevicePeripherals } from './RemoteExecutionEv3Types';

export interface Device {
  id: number;
  title: string;
  secret: string;
  type: string;
  peripherals?: Ev3DevicePeripherals;
}

export interface WebSocketEndpointInformation {
  endpoint: string;
  clientNamePrefix: string;
  thingName: string;
}

export type DeviceConnection =
  | { status: 'CONNECTING'; client?: SlingClient; endpoint?: WebSocketEndpointInformation }
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
  languageChapter: Chapter;
  deviceLibraryName: ExternalLibraryName;
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
      'ev3_playSequence',
      'ev3_ledLeftGreen',
      'ev3_ledLeftRed',
      'ev3_ledRightGreen',
      'ev3_ledRightRed',
      'ev3_ledGetBrightness',
      'ev3_ledSetBrightness'
    ],
    languageChapter: Chapter.SOURCE_3,
    deviceLibraryName: ExternalLibraryName.EV3
  }
];

export const deviceTypesById: Map<string, DeviceType> = new Map(
  deviceTypes.map(type => [type.id, type])
);
