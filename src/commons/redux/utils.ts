import {
  type ActionCreatorWithOptionalPayload,
  type ActionCreatorWithoutPayload,
  type ActionCreatorWithPreparedPayload,
  createAction
} from '@reduxjs/toolkit';
import * as Sentry from '@sentry/browser';
import type { SagaIterator } from 'redux-saga';
import { type StrictEffect, takeLatest, takeLeading } from 'redux-saga/effects';

import { safeTakeEvery } from '../sagas/SafeEffects';
import { objectEntries } from '../utils/TypeHelper';

/**
 * Creates actions, given a base name and base actions
 * @param baseName The base name of the actions
 * @param baseActions The base actions. Use a falsy value to create an action without a payload.
 * @returns An object containing the actions
 */
export function createActions<BaseName extends string, BaseActions extends Record<string, any>>(
  baseName: BaseName,
  baseActions: BaseActions
) {
  return Object.entries(baseActions).reduce(
    (res, [name, func]) => ({
      ...res,
      [name]: func
        ? createAction(`${baseName}/${name}`, (...args: any) => ({ payload: func(...args) }))
        : createAction(`${baseName}/${name}`)
    }),
    {} as {
      [K in keyof BaseActions]: K extends string
        ? BaseActions[K] extends (...args: any) => any
          ? ActionCreatorWithPreparedPayload<
              Parameters<BaseActions[K]>,
              ReturnType<BaseActions[K]>,
              `${BaseName}/${K}`
            >
          : ActionCreatorWithoutPayload<`${BaseName}/${K}`>
        : never;
    }
  );
}

function wrapSaga<T extends (...args: any[]) => Generator>(saga: T) {
  return function* (...args: Parameters<T>) {
    try {
      return yield* saga(...args);
    } catch (error) {
      handleUncaughtError(error);
    }
  };
}

type SagaHandler<
  T extends ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload<any>
> = (action: ReturnType<T>) => Generator<StrictEffect>;

export function combineSagaHandlers<
  TActions extends Record<
    string,
    ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload<any>
  >
>(
  actions: TActions,
  handlers: {
    // TODO: Maybe this can be stricter? And remove the optional type after migration is fully done
    [K in keyof TActions]?:
      | SagaHandler<TActions[K]>
      | { takeLeading: SagaHandler<TActions[K]> }
      | { takeLatest: SagaHandler<TActions[K]> };
  },
  others?: (takeEvery: typeof saferTakeEvery) => SagaIterator
): () => SagaIterator {
  return function* (): SagaIterator {
    for (const [actionName, saga] of objectEntries(handlers)) {
      if (saga === undefined) {
        continue;
      } else if (typeof saga === 'function') {
        yield safeTakeEvery(actions[actionName].type, saga);
      } else if ('takeLeading' in saga) {
        yield takeLeading(actions[actionName].type, wrapSaga(saga.takeLeading));
      } else if ('takeLatest' in saga) {
        yield takeLatest(actions[actionName].type, wrapSaga(saga.takeLatest));
      } else {
        throw new Error(`Unknown saga handler type for ${actionName as string}`);
      }
    }

    if (others) {
      const obj = others(saferTakeEvery);
      while (true) {
        const { done, value } = obj.next();
        if (done) break;
        yield value;
      }
    }
  };
}

export function saferTakeEvery<
  Action extends
    | ActionCreatorWithOptionalPayload<any>
    | ActionCreatorWithPreparedPayload<any[], any>
>(actionPattern: Action, fn: (action: ReturnType<Action>) => Generator<StrictEffect<any>>) {
  return safeTakeEvery(actionPattern.type, fn);
}

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
