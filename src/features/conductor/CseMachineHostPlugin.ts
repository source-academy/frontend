/**
 * Concrete subclass of the abstract CseMachineHostPlugin from @sourceacademy/web-cse-machine.
 *
 * The abstract base handles channel transport (subscribes to the __cse channel, calls
 * receiveSnapshots). This subclass makes receiveSnapshots reassignable so evalCode.ts
 * can wire it to a Redux eventChannel after construction.
 */
import {
  CseMachineHostPlugin as _CseMachineHostPluginBase,
  type CseSnapshot,
} from '@sourceacademy/web-cse-machine';

export class CseMachineHostPlugin extends _CseMachineHostPluginBase {
  receiveSnapshots: (snapshots: CseSnapshot[]) => void = () => {};
}

export type {
  CseSnapshot,
  CseSerializedValue,
  CseSerializedInstruction,
  CseSerializedBinding,
  CseSerializedEnvFrame,
  CseSnapshotMessage,
} from '@sourceacademy/web-cse-machine';
