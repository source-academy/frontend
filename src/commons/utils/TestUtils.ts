import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { createRenderer } from 'react-test-renderer/shallow';

export const shallowRender = (element: React.ReactElement) => {
  const renderer = createRenderer();
  renderer.render(element);
  return renderer.getRenderOutput();
};

export const renderTree = async (element: React.ReactElement) => {
  const app = renderer.create(element);
  await act(() => app);
  return app;
};

export const renderTreeJson = async (element: React.ReactElement) => {
  const app = await renderTree(element);
  return app.toJSON();
};

/**
 * Recursively traverses a nested object and returns all matches.
 *
 * Used in traversing nested objects such as `shallowRender`'s output.
 */
export function deepFilter<T>(
  nestedObject: T,
  matchFn: (e: T) => boolean,
  getChildren: (e: T) => T[]
) {
  const matches: any[] = [];

  function helper(obj: T) {
    if (matchFn(obj)) {
      matches.push(obj);
    }

    const children = getChildren(obj);
    if (children && Array.isArray(children)) {
      children.forEach(e => {
        if (e) {
          helper(e);
        }
      });
    }
  }

  helper(nestedObject);
  return matches;
}

// TODO: Fix type inference for this function,
// then use it in tests. We no longer need to
// check the action type as everything gets migrated
// to RTK and explicit action types are no longer needed.
// /**
//  * The `expectActionPayload` function is used to test the payload
//  * of an action.
//  * @param action The action to test
//  */
// export function expectActionPayload<Action extends ActionCreatorWithPreparedPayload<any, any>>(
//   action: ReturnType<Action>
// ) {
//   const payload: ReturnType<Action>['payload'] = action.payload;
//   return expect(payload);
// }
