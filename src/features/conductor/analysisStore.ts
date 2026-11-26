import type {
  AnalysisCapabilities,
  AnalysisPosition,
  AnalysisRange,
} from '@sourceacademy/common-autocomplete';
import type { ITabService } from '@sourceacademy/common-tabs';
import { useCallback, useSyncExternalStore } from 'react';

import { getAutocompleteEvaluatorPath } from './autocompleteModeStore';

/**
 * What an evaluator offers the editor about the code in it (see `AnalysisCapabilities`): the
 * requests that it answers, and a way to put them. Published once the evaluator has said which it
 * answers; until then, and for an evaluator that never does, there is none, and the editor
 * features that are built on it are off.
 */
export type AnalysisProvider = {
  readonly capabilities: AnalysisCapabilities;
  occurrences(code: string, position: AnalysisPosition): Promise<AnalysisRange[]>;
  definition(code: string, position: AnalysisPosition): Promise<AnalysisRange | null>;
  scope(code: string, position: AnalysisPosition): Promise<AnalysisRange[]>;
};

type Entry = { readonly provider: AnalysisProvider; readonly owner: symbol };

const entries = new Map<string, Entry>();
const currentOwners = new Map<string, symbol>();
const listeners = new Map<string, Set<() => void>>();

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

/**
 * Publishes the analysis of one concrete evaluator instance, as the mode of its syntax is (see
 * `createAutocompleteModePublisher`): an older instance, whose evaluator is being torn down while
 * a newer one is prepared, must not clear or overwrite what the newer one has published.
 */
export function createAnalysisPublisher(tabService: ITabService) {
  const evaluatorPath = getAutocompleteEvaluatorPath(tabService);
  if (!evaluatorPath) {
    throw new Error('Analysis tab service is not associated with an evaluator');
  }
  const owner = Symbol(evaluatorPath);
  currentOwners.set(evaluatorPath, owner);
  return {
    publish(provider: AnalysisProvider): void {
      if (currentOwners.get(evaluatorPath) !== owner) {
        return;
      }
      entries.set(evaluatorPath, { provider, owner });
      emit(evaluatorPath);
    },
    dispose(): void {
      if (currentOwners.get(evaluatorPath) === owner) {
        currentOwners.delete(evaluatorPath);
      }
      if (entries.get(evaluatorPath)?.owner !== owner) {
        return;
      }
      entries.delete(evaluatorPath);
      emit(evaluatorPath);
    },
  };
}

/** The analysis that the evaluator at `evaluatorPath` offers, if it has said that it offers any. */
export function useAnalysisProvider(
  evaluatorPath: string | undefined,
): AnalysisProvider | undefined {
  const subscribeToPath = useCallback(
    (listener: () => void) => subscribe(evaluatorPath, listener),
    [evaluatorPath],
  );
  const getSnapshot = useCallback(
    () => (evaluatorPath ? entries.get(evaluatorPath)?.provider : undefined),
    [evaluatorPath],
  );
  return useSyncExternalStore(subscribeToPath, getSnapshot, getSnapshot);
}
