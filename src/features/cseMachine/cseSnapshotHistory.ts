import type { CseSerializedEnvFrame, CseSnapshot } from '../conductor/CseMachineHostPlugin';

/**
 * `snapshots[step]`, plus every frame seen in an earlier snapshot that is no longer in it, as a
 * dead frame — so the diagram can show (and "Clear Unreachable Objects" can remove) frames that are gone.
 * Shared by the CSE Machine tab and the environment view lent to web plugins.
 */
export function snapshotWithDeadFrames(snapshots: CseSnapshot[], step: number): CseSnapshot {
  const snapshot = snapshots[step];
  const seen = new Map<string, CseSerializedEnvFrame>();
  for (let i = 0; i <= step; i++) {
    for (const frame of snapshots[i]?.environments ?? []) {
      seen.set(frame.id, frame);
    }
  }
  const liveIds = new Set(snapshot.environments.map(f => f.id));
  const deadFrames = [...seen.values()]
    .filter(f => !liveIds.has(f.id))
    .map(f => ({ ...f, isActive: false, isOnCallStack: false }));
  return { ...snapshot, environments: [...snapshot.environments, ...deadFrames] };
}

/**
 * The last of `snapshots`, with every frame the run ever had — those that are gone as dead
 * frames — in the order the frames first appeared. Laid out once, it gives each frame the place it
 * keeps at every step (see `CseMachine.drawEnvironments`), as the CSE Machine tab places a Source
 * program's frames where they are at its last step (source-academy/frontend#3594).
 */
export function snapshotWithAllFrames(snapshots: CseSnapshot[]): CseSnapshot | undefined {
  const last = snapshots[snapshots.length - 1];
  if (last === undefined) {
    return undefined;
  }
  // A frame keeps the position of its first appearance, and takes its latest contents.
  const latest = new Map<string, CseSerializedEnvFrame>();
  for (const snapshot of snapshots) {
    for (const frame of snapshot.environments) {
      latest.set(frame.id, frame);
    }
  }
  const liveIds = new Set(last.environments.map(f => f.id));
  const environments = [...latest.values()].map(f =>
    liveIds.has(f.id) ? f : { ...f, isActive: false, isOnCallStack: false },
  );
  return { ...last, environments };
}
