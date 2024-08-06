import { ActionMatchingPattern } from '@redux-saga/types';
import * as Sentry from '@sentry/browser';
import {
  ActionPattern,
  ForkEffect,
  HelperWorkerParameters,
  takeEvery,
  takeLatest,
  takeLeading
} from 'redux-saga/effects';
import type { ErrorPayload } from 'vite';

// it's not possible to abstract the two functions into HOF over takeEvery and takeLatest
// without stepping out of TypeScript's type system because the type system does not support
// higher-kinded types (type parameters that take )

function handleUncaughtError(error: any) {
  if (process.env.NODE_ENV === 'development') {
    const showErrorOverlay = (err: Partial<ErrorPayload['err']>) => {
      const ErrorOverlay = customElements.get('vite-error-overlay');
      if (ErrorOverlay == null) return;
      document.body.appendChild(new ErrorOverlay(err));
    };
    showErrorOverlay(error);
  }
  Sentry.captureException(error);
  console.error(error);
}

function isIterator(obj: any) {
  return obj && typeof obj.next === 'function' && typeof obj.throw === 'function';
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
