import type { ITabService } from '@sourceacademy/common-tabs';
import { useCallback, useSyncExternalStore } from 'react';

type ModeSnapshot = {
  readonly modeId: string | null;
  readonly owner: symbol | null;
};

const EMPTY_SNAPSHOT: ModeSnapshot = {
  modeId: null,
  owner: null,
};

const snapshots = new Map<string, ModeSnapshot>();
const listeners = new Map<string, Set<() => void>>();
const evaluatorPaths = new WeakMap<ITabService, string>();

export function normalizeAceModeId(modeId: string): string {
  return modeId.startsWith('ace/mode/') ? modeId : `ace/mode/${modeId}`;
}

function emit(evaluatorPath: string): void {
  for (const listener of listeners.get(evaluatorPath) ?? []) {
    listener();
  }
}

function subscribe(evaluatorPath: string | undefined, listener: () => void): () => void {
  if (!evaluatorPath) {
    return () => {};
  }

  const pathListeners = listeners.get(evaluatorPath) ?? new Set<() => void>();
  pathListeners.add(listener);
  listeners.set(evaluatorPath, pathListeners);
  return () => {
    pathListeners.delete(listener);
    if (pathListeners.size === 0) {
      listeners.delete(evaluatorPath);
    }
  };
}

function getSnapshot(evaluatorPath: string | undefined): ModeSnapshot {
  return evaluatorPath ? (snapshots.get(evaluatorPath) ?? EMPTY_SNAPSHOT) : EMPTY_SNAPSHOT;
}

/**
 * Publishes the mode owned by one concrete evaluator/conductor instance.
 *
 * Ownership prevents an older conductor from clearing a newer instance's mode
 * when evaluator preparation and cleanup overlap.
 */
export function associateAutocompleteEvaluator(
  tabService: ITabService,
  evaluatorPath: string,
): void {
  evaluatorPaths.set(tabService, evaluatorPath);
}

const currentOwners = new Map<string, symbol>();

export function createAutocompleteModePublisher(tabService: ITabService) {
  const evaluatorPath = evaluatorPaths.get(tabService);
  if (!evaluatorPath) {
    throw new Error('Autocomplete tab service is not associated with an evaluator');
  }
  const owner = Symbol(evaluatorPath);
  currentOwners.set(evaluatorPath, owner);
  return {
    publish(modeId: string): void {
      // Without this check, an older publisher that hasn't been disposed yet (evaluator
      // preparation and cleanup can overlap - see conductorEvaluatorCache.ts) could publish
      // after a newer instance already has, clobbering the newer mode with stale data.
      if (currentOwners.get(evaluatorPath) !== owner) {
        return;
      }
      snapshots.set(evaluatorPath, {
        modeId: normalizeAceModeId(modeId),
        owner,
      });
      emit(evaluatorPath);
    },
    dispose(): void {
      if (snapshots.get(evaluatorPath)?.owner !== owner) {
        return;
      }
      snapshots.delete(evaluatorPath);
      emit(evaluatorPath);
    },
  };
}

export function useAutocompleteMode(evaluatorPath: string | undefined): string | null {
  const subscribeToPath = useCallback(
    (listener: () => void) => subscribe(evaluatorPath, listener),
    [evaluatorPath],
  );
  const getPathSnapshot = useCallback(() => getSnapshot(evaluatorPath), [evaluatorPath]);
  return useSyncExternalStore(subscribeToPath, getPathSnapshot, getPathSnapshot).modeId;
}
