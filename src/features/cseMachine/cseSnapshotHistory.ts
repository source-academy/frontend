import type { CseSerializedEnvFrame, CseSnapshot } from '../conductor/CseMachineHostPlugin';

/**
 * `snapshots[step]`, plus every frame seen in an earlier snapshot that is no longer in it, as a
 * dead frame — so the diagram can show (and "Clear Dead Frames" can remove) frames that are gone.
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
