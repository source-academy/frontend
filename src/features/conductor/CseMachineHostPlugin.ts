/**
 * Concrete subclass of the abstract CseMachineHostPlugin from @sourceacademy/web-cse-machine.
 *
 * The abstract base handles channel transport (subscribes to the __cse channel, calls
 * receiveSnapshots). This subclass makes receiveSnapshots reassignable so evalCode.ts
 * can wire it to a Redux eventChannel after construction.
 */
import { CseMachineHostPlugin as _CseMachineHostPluginBase } from '@sourceacademy/web-cse-machine';

export class CseMachineHostPlugin extends _CseMachineHostPluginBase {
  // Widen the signature to accept whatever the base expects (varies by package version).
  receiveSnapshots: (...args: any[]) => void = () => {};
}

export type {
  CseSerializedBinding,
  CseSerializedEnvFrame,
  CseSerializedInstruction,
  CseSerializedValue,
  CseSnapshot,
  CseSnapshotMessage,
} from '@sourceacademy/web-cse-machine';
