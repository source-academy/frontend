import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPreparedPayload,
  CaseReducer,
  createAction,
  createReducer,
  PayloadAction
} from '@reduxjs/toolkit';
import { TypedActionCreator } from '@reduxjs/toolkit/dist/mapBuilders';
import { SagaIterator } from 'redux-saga';

import { ActionSaga, safeTakeEvery } from './utils/SafeEffects';
import { SideContentLocation } from './workspace/WorkspaceReduxTypes';

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
              K
            >
          : ActionCreatorWithoutPayload<`${BaseName}/${K}`>
        : never;
    }
  );
}

export function combineSagaHandlers<
  TActions extends Record<
    string,
    ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload<any>
  >
>(
  actions: TActions,
  handlers: Partial<{
    [K in keyof TActions]: ActionSaga<TActions[K]>
  }>,
  others?: () => SagaIterator
): () => SagaIterator {
  // console.log(handlers)
  const sagaHandlers = Object.entries(handlers).map(([actionName, saga]) =>
    {
      try {
        return safeTakeEvery(actions[actionName].type, saga);
      } catch (error) {
        console.log(`Errored on ${actionName}: Type: ${actions[actionName].type}`)
        throw error
      }
    }
  );
  return function* (): SagaIterator {
    yield* sagaHandlers;
    if (others) {
      const obj = others();
      while (true) {
        const { done, value } = obj.next();
        if (done) break;
        yield value;
      }
    }
  };
}

export function buildReducer<TState, TActions extends Record<string, TypedActionCreator<any>>>(
  initialState: TState,
  actions: TActions,
  reducers: {
    [K in keyof TActions]: CaseReducer<TState, ReturnType<TActions[K]>>;
  }
) {
  return createReducer(initialState, builder => {
    Object.entries(reducers).forEach(([name, reducer]) => builder.addCase(actions[name], reducer));
  });
}

type ActionCreator = ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload<any>
export function addLocation<
  TActions extends Record<string, ActionCreator>,
  TLoc extends SideContentLocation
>(actions: TActions) {
  return Object.entries(actions).reduce(
    (res, [name, creator]) => {
      const newCreator: ActionCreator = (location: TLoc, ...args: any) => {
        const action = creator(...args);
        return {
          ...action,
          payload: {
            payload: (action as PayloadAction<any>).payload,
            location
          }
        };
      }
      newCreator.type = creator.type
      newCreator.toString = creator.toString
      newCreator.match = creator.match

      return ({
        ...res,
        [name]: newCreator,
      });
    },
    {} as {
      [K in keyof TActions]: TActions[K] extends ActionCreatorWithPreparedPayload<
        infer Args,
        infer Payload
      >
        ? ActionCreatorWithPreparedPayload<[TLoc, ...Args], { payload: Payload; location: TLoc }>
        : ActionCreatorWithPreparedPayload<[TLoc], { location: TLoc }>;
    }
  );
}
