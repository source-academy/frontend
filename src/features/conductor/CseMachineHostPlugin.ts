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
  type CseTraceEnd,
} from '@sourceacademy/web-cse-machine';

export class CseMachineHostPlugin extends _CseMachineHostPluginBase {
  receiveSnapshots: (snapshots: CseSnapshot[], breakpointSteps: number[]) => void = () => {};

  /** What to do when a run that was sent in batches ends; evalCode.ts wires it like `receiveSnapshots`. */
  onEnd: (end: CseTraceEnd) => void = () => {};

  // The base class's `receiveEnd` is a method (it has a default), so it cannot be reassigned as a
  // property; it hands over to `onEnd`, which can.
  override receiveEnd(end: CseTraceEnd): void {
    this.onEnd(end);
  }
}

export type {
  CseSnapshot,
  CseSerializedValue,
  CseSerializedInstruction,
  CseSerializedBinding,
  CseSerializedEnvFrame,
  CseSnapshotMessage,
  CseTraceEnd,
} from '@sourceacademy/web-cse-machine';
