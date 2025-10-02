import {
  ActionCreator,
  ActionCreatorWithPreparedPayload,
  createAction,
  createReducer,
  type ActionCreatorWithoutPayload,
  type CaseReducer
} from '@reduxjs/toolkit';
import { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';
import type { SagaIterator } from 'redux-saga';
import { takeEvery, takeLatest, takeLeading, type ForkEffect } from 'redux-saga/effects';

import { wrapSaga } from '../sagas/SafeEffects';
import { objectEntries } from '../utils/TypeHelper';
import type { WorkspaceLocation } from './WorkspaceTypes';

/**
 * Represents the handler for the action returned by the provided ActionCreator
 */
type SagaHandler<T extends ActionCreator<any>> = (action: ReturnType<T>) => Generator;
/**
 * Represents the possible handlers for the action returned by the provided ActionCreator.
 * If a function is given, then `takeEvery` is assumed. Otherwise each fork
 * effect is called with its corresponding handler
 */
type SagaHandlers<T extends ActionCreator<any>> =
  | SagaHandler<T>
  | {
      takeEvery?: SagaHandler<T>;
      takeLeading?: SagaHandler<T>;
      takeLatest?: SagaHandler<T>;
    };

/**
 * Represents an Action that has no saga handlers and no payload but may have a reducer
 */
type ActionDefinitionWithoutPayload<TType extends string, BaseName extends string, State> = {
  // creator: null;
  reducer?: CaseReducer<State, ReturnType<ActionCreatorWithoutPayload<`${BaseName}/${TType}`>>>;
};

/**
 * Represents an Action that has saga handlers but no payload and may have a reducer
 */
export type ActionDefinitionWithoutPayloadWithSaga<
  TType extends string,
  BaseName extends string,
  State
> = ActionDefinitionWithoutPayload<TType, BaseName, State> & {
  saga: SagaHandlers<
    ActionCreatorWithPreparedPayload<
      [WorkspaceLocation],
      { workspaceLocation: WorkspaceLocation },
      `${BaseName}/${TType}`
    >
  >;
};

/**
 * Represents an Action that has a payload but no saga handlers and may have a reducer
 */
export type ActionDefinitionWithPayload<
  TType extends string,
  BaseName extends string,
  Args extends any[],
  Payload,
  State
> = {
  creator: (...args: Args) => Payload;
  reducer?: CaseReducer<
    State,
    ReturnType<ActionCreatorWithPreparedPayload<Args, Payload, `${BaseName}/${TType}`>>
  >;
};

/**
 * Represents an Action that has a payload and saga handlers and may have a reducer
 */
type ActionDefinitionWithPayloadAndSaga<
  TType extends string,
  BaseName extends string,
  Args extends any[],
  Payload,
  State
> = ActionDefinitionWithPayload<TType, BaseName, Args, Payload, State> & {
  saga: SagaHandlers<
    ActionCreatorWithPreparedPayload<
      [WorkspaceLocation, ...Args],
      { workspaceLocation: WorkspaceLocation; payload: Payload },
      `${BaseName}/${TType}`
    >
  >;
};

/**
 * Represents a collection of actions that have no saga handlers
 */
type ActionDefintionsWithoutSaga<T extends string, U extends string, State> = Record<
  T,
  | ActionDefinitionWithPayload<string, U, any, any, State>
  | ActionDefinitionWithoutPayload<string, U, State>
>;

/**
 * Represents a collection of actions that have saga handlers
 */
type ActionDefinitionsWithSaga<T extends string, U extends string, State> = Record<
  T,
  | ActionDefinitionWithPayloadAndSaga<string, U, any, any, State>
  | ActionDefinitionWithoutPayloadWithSaga<string, U, State>
>;

type ActionDefinitionsWithPayload<
  TType extends string,
  BaseName extends string,
  Args extends any[],
  Payload,
  State
> = Record<TType,
  | ActionDefinitionWithPayload<TType, BaseName, Args, Payload, State>
  | ActionDefinitionWithPayloadAndSaga<TType, BaseName, Args, Payload, State>
>

// type ActionDefinitionsWithoutPayload<T extends string, U extends string, State> = Record<T,
//   | ActionDefinitionWithoutPayload<T, U, State>
//   | ActionDefinitionWithoutPayloadWithSaga<T, U, State>
// >

/**
 * Represents the types of the actual action creators that can be used
 * to create the actions that are dispatched
 */
type CreatedActions<
  BaseName extends string,
  State,
  T extends
    | ActionDefinitionsWithSaga<string, BaseName, State>
    | ActionDefintionsWithoutSaga<string, BaseName, State>
> = {
  [K in keyof T]: K extends string
    ? T[K] extends ActionDefinitionsWithPayload<infer TType, string, infer Args, infer P, State>
      ? ActionCreatorWithPreparedPayload<
          [workspaceLocation: WorkspaceLocation, ...Args],
          { workspaceLocation: WorkspaceLocation; payload: P },
          `${BaseName}/${TType}`
        >
      : ActionCreatorWithPreparedPayload<
          [workspaceLocation: WorkspaceLocation],
          { workspaceLocation: WorkspaceLocation },
          `${BaseName}/${K}`
        >
    : never;
};

export function createActions<BaseName extends string, TActions extends string, TState>(
  baseName: BaseName,
  defaultState: TState,
  handlers: ActionDefintionsWithoutSaga<TActions, BaseName, TState>
): {
  reducer: ReducerWithInitialState<TState>;
  actions: CreatedActions<BaseName, TState, typeof handlers>;
};
export function createActions<BaseName extends string, TActions extends string, TState>(
  baseName: BaseName,
  defaultState: TState,
  handlers: ActionDefinitionsWithSaga<TActions, BaseName, TState>
): {
  reducer: ReducerWithInitialState<TState>;
  actions: CreatedActions<BaseName, TState, typeof handlers>;
  saga: () => SagaIterator;
};
export function createActions<BaseName extends string, TActions extends string, TState>(
  baseName: BaseName,
  defaultState: TState,
  handlers:
    | ActionDefintionsWithoutSaga<TActions, BaseName, TState>
    | ActionDefinitionsWithSaga<TActions, BaseName, TState>
) {
  const actionCreators: Record<string, any> = {};
  const sagaEffects: ForkEffect[] = [];

  const reducer = createReducer(defaultState, reducerBuilder => {
    for (const [actionType, actionConfig] of objectEntries(handlers)) {
      const fullActionType = `${baseName}/${actionType}`;
      if ('creator' in actionConfig) {
        actionCreators[actionType] = createAction(
          fullActionType,
          (workspaceLocation: WorkspaceLocation, ...args: any[]) => {
            const payload = actionConfig.creator(...args);
            return { payload: { workspaceLocation, payload } };
          }
        );
      } else {
        actionCreators[actionType] = createAction(
          fullActionType,
          (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
        );
      }

      if (actionConfig.reducer) {
        reducerBuilder.addCase(fullActionType, actionConfig.reducer);
      }

      if (!('saga' in actionConfig)) continue;

      const { saga } = actionConfig;
      if (typeof saga === 'function') {
        sagaEffects.push(takeEvery(fullActionType, wrapSaga(saga)));
        continue;
      }

      if (saga.takeEvery) {
        sagaEffects.push(takeEvery(fullActionType, wrapSaga(saga.takeEvery)));
      }

      if (saga.takeLeading) {
        sagaEffects.push(takeLeading(fullActionType, wrapSaga(saga.takeLeading)));
      }

      if (saga.takeLatest) {
        sagaEffects.push(takeLatest(fullActionType, wrapSaga(saga.takeLatest)));
      }
    }
  });
  if (sagaEffects.length > 0) {
    return {
      actions: actionCreators,
      reducer,
      saga: function* (): SagaIterator {
        yield* sagaEffects;
      }
    };
  }

  return {
    actions: actionCreators,
    reducer
  };
}
