import type { ActionMatchingPattern } from '@redux-saga/types';
import * as Sentry from '@sentry/react';
import {
  type ActionPattern,
  type ForkEffect,
  type HelperWorkerParameters,
  select,
  SelectEffect,
  takeEvery,
  takeLatest,
  takeLeading
} from 'redux-saga/effects';
import type { StoriesEnvState } from 'src/features/stories/StoriesTypes';

import type { OverallState } from '../application/ApplicationTypes';
import type { WorkspaceLocation, WorkspaceManagerState } from '../workspace/WorkspaceTypes';

// it's not possible to abstract the two functions into HOF over takeEvery and takeLatest
// without stepping out of TypeScript's type system because the type system does not support
// higher-kinded types (type parameters that take )

function handleUncaughtError(error: any) {
  if (process.env.NODE_ENV === 'development') {
    // react-error-overlay is a "special" package that's automatically included
    // in development mode by CRA

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('react-error-overlay').then(reo => reo.reportRuntimeError(error));
  }
  Sentry.captureException(error);
  console.error(error);
}

function isIterator(obj: any) {
  return obj && typeof obj.next === 'function' && typeof obj.throw === 'function';
}

export function wrapSaga<T extends (...args: any[]) => Generator>(saga: T) {
  return function* (...args: Parameters<T>) {
    try {
      return yield* saga(...args);
    } catch (error) {
      handleUncaughtError(error);
    }
  };
}

export function safeTakeEvery<P extends ActionPattern, A extends ActionMatchingPattern<P>>(
  pattern: P,
  worker: (action: A) => any
): ForkEffect<never>;
export function safeTakeEvery<P extends ActionPattern, Fn extends (...args: any[]) => any>(
  pattern: P,
  worker: Fn,
  ...args: HelperWorkerParameters<ActionMatchingPattern<P>, Fn>
): ForkEffect<never> {
  function* wrappedWorker(...args: HelperWorkerParameters<ActionMatchingPattern<P>, Fn>) {
    try {
      const result = worker(...args);
      if (isIterator(result)) {
        yield* result;
      }
    } catch (error) {
      handleUncaughtError(error);
    }
  }
  return takeEvery<P, typeof wrappedWorker>(pattern, wrappedWorker, ...args);
}

export function safeTakeLatest<P extends ActionPattern, A extends ActionMatchingPattern<P>>(
  pattern: P,
  worker: (action: A) => any
): ForkEffect<never>;
export function safeTakeLatest<P extends ActionPattern, Fn extends (...args: any[]) => any>(
  pattern: P,
  worker: Fn,
  ...args: HelperWorkerParameters<ActionMatchingPattern<P>, Fn>
): ForkEffect<never> {
  function* wrappedWorker(...args: HelperWorkerParameters<ActionMatchingPattern<P>, Fn>) {
    try {
      const result = worker(...args);
      if (isIterator(result)) {
        yield* result;
      }
    } catch (error) {
      handleUncaughtError(error);
    }
  }
  return takeLatest<P, typeof wrappedWorker>(pattern, wrappedWorker, ...args);
}

export function safeTakeLeading<P extends ActionPattern, A extends ActionMatchingPattern<P>>(
  pattern: P,
  worker: (action: A) => any
): ForkEffect<never>;
export function safeTakeLeading<P extends ActionPattern, Fn extends (...args: any[]) => any>(
  pattern: P,
  worker: Fn,
  ...args: HelperWorkerParameters<ActionMatchingPattern<P>, Fn>
): ForkEffect<never> {
  function* wrappedWorker(...args: HelperWorkerParameters<ActionMatchingPattern<P>, Fn>) {
    try {
      const result = worker(...args);
      if (isIterator(result)) {
        yield* result;
      }
    } catch (error) {
      handleUncaughtError(error);
    }
  }
  return takeLeading<P, typeof wrappedWorker>(pattern, wrappedWorker, ...args);
}

export function selectWorkspace<T extends WorkspaceLocation, U>(
  workspaceLocation: T,
  func: (state: WorkspaceManagerState[T]) => U
): Generator<SelectEffect, U>;
export function selectWorkspace<T extends WorkspaceLocation>(
  workspaceLocation: T
): Generator<SelectEffect, WorkspaceManagerState[T]>;
export function* selectWorkspace<T extends WorkspaceLocation, U>(
  workspaceLocation: T,
  f?: (state: WorkspaceManagerState[T]) => U
) {
  const workspace: WorkspaceManagerState[T] = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation]
  );

  if (f) return f(workspace);
  return workspace;
}

export function* selectStoryEnv(storyEnv: string) {
  const workspace: StoriesEnvState = yield select(
    (state: OverallState) => state.stories.envs[storyEnv]
  );
  return workspace;
}
