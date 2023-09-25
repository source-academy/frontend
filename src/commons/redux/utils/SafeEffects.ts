import { Action, ActionCreatorWithoutPayload,ActionCreatorWithPreparedPayload } from "@reduxjs/toolkit";
import * as Sentry from '@sentry/browser';
import { ForkEffect, RaceEffect, StrictEffect, take, TakeEffect, takeEvery, takeLatest } from "redux-saga/effects";

type ActionCreator = ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload<any>
type SagaReturn = Generator<StrictEffect<any>
  | TakeEffect
  | RaceEffect<any>
  | Promise<any>, 
any, any>
export type ActionSaga<T extends ActionCreator> = (action: ReturnType<T>) => SagaReturn

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

function wrapSaga<T extends ActionCreator>(saga: ActionSaga<T>) {
  return function* (action: ReturnType<T>) {
    try {
      yield* saga(action) as any
    } catch (error) {
      handleUncaughtError(error)
    }
  }
}

export function safeTake<T extends ActionCreator>(creator: T): TakeEffect
export function safeTake(pattern: string): TakeEffect
export function safeTake<T extends ActionCreator>(creator: T | string) {
  return take(typeof creator === 'string' ? creator : creator.type)
}

export function safeTakeEvery<T extends ActionCreator>(creator: T, saga: ActionSaga<T>): ForkEffect<any>
export function safeTakeEvery<T extends Action>(pattern: T['type'], saga: (action: T) => SagaReturn): ForkEffect<any>
export function safeTakeEvery(pattern: ActionCreator | string, saga: any) {
  return takeEvery(typeof pattern === 'string' ? pattern : pattern.type, wrapSaga(saga))
}

export function safeTakeLatest<T extends ActionCreator>(creator: T, saga: ActionSaga<T>): ForkEffect<any>
export function safeTakeLatest<T extends Action>(pattern: T['type'], saga: (action: T) => SagaReturn): ForkEffect<any>
export function safeTakeLatest(pattern: ActionCreator | string, saga: any) {
  return takeLatest(typeof pattern === 'string' ? pattern : pattern.type, wrapSaga(saga))
}
