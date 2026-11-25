import { SlingClient } from '@sourceacademy/sling-client';
import type { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

import type { Ev3DevicePeripherals } from './RemoteExecutionEv3Types';

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
}

export const deviceTypes: DeviceType[] = [
  {
    id: 'EV3',
    name: 'Lego Mindstorms EV3',
  },
];
