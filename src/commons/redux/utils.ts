import {
  type ActionCreatorWithOptionalPayload,
  type ActionCreatorWithoutPayload,
  type ActionCreatorWithPreparedPayload,
  createAction
} from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { type StrictEffect, takeEvery, takeLatest, takeLeading } from 'redux-saga/effects';

import { safeTakeEvery, wrapSaga } from '../sagas/SafeEffects';
import type { SourceActionType } from '../utils/ActionsHelper';
import { type ActionTypeToCreator, objectEntries } from '../utils/TypeHelper';

/**
 * Creates actions, given a base name and base actions
 * @param baseName The base name of the actions
 * @param baseActions The base actions. Use a non function value to create an action without a payload.
 * @returns An object containing the actions
 */
export function createActions<BaseName extends string, BaseActions extends Record<string, any>>(
  baseName: BaseName,
  baseActions: BaseActions
) {
  return Object.entries(baseActions).reduce(
    (res, [name, func]) => ({
      ...res,
      [name]:
        typeof func === 'function'
          ? createAction(`${baseName}/${name}`, (...args: any) => ({ payload: func(...args) }))
          : createAction(`${baseName}/${name}`)
    }),
    {} as Readonly<{
      [K in keyof BaseActions]: K extends string
        ? BaseActions[K] extends (...args: any) => any
          ? ActionCreatorWithPreparedPayload<
              Parameters<BaseActions[K]>,
              ReturnType<BaseActions[K]>,
              `${BaseName}/${K}`
            >
          : ActionCreatorWithoutPayload<`${BaseName}/${K}`>
        : never;
    }>
  );
}

type SagaHandler<T extends SourceActionType['type']> = (
  action: ReturnType<ActionTypeToCreator<T>>
) => Generator<StrictEffect>;

type SagaHandlers = {
  [K in SourceActionType['type']]?:
    | SagaHandler<K>
    | Partial<Record<'takeEvery' | 'takeLatest' | 'takeLeading', SagaHandler<K>>>;
};

export function combineSagaHandlers(handlers: SagaHandlers) {
  return function* (): SagaIterator {
    for (const [actionName, saga] of objectEntries(handlers)) {
      if (saga === undefined) {
        continue;
      } else if (typeof saga === 'function') {
        yield takeEvery(actionName, wrapSaga(saga));
        continue;
      }

      if (saga.takeEvery) {
        yield takeEvery(actionName, wrapSaga(saga.takeEvery));
      }

      if (saga.takeLeading) {
        yield takeLeading(actionName, wrapSaga(saga.takeLeading));
      }

      if (saga.takeLatest) {
        yield takeLatest(actionName, wrapSaga(saga.takeLatest));
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
