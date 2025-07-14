import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { createRenderer } from 'react-test-renderer/shallow';

export const shallowRender = (element: React.ReactElement) => {
  const renderer = createRenderer();
  renderer.render(element);
  return renderer.getRenderOutput();
};

export const renderTree = async (element: React.ReactElement) => {
  // Safe to do this since we don't have any async components
  // In React 19, components can return `ReactNode | Promise<ReactNode>`
  const app = renderer.create(element as any);
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
  getChildren: (e: T) => T[] | undefined
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

// (18 March 2022)
// Problem to be fixed in the future:
//
// There seems to be an inconsistency between how jest and how typescript
// behaves when encountering imports of the form `import * as x from 'x.json'`
// jest will set x = jsonobject,
// but typescript will instead set x = { default: jsonobject }
//
// This means that under typescript, we want `import x from 'x.json'`,
// while under jest, we want `import * as x from 'x.json'`
//
// This problem was hidden when transpiling to CommonJS modules before, which
// behaves similarly to jest. But now that we are transpiling to es6,
// typescript projects that depend on js-slang may now be exposed to this
// inconsistency.
//
// For now, we use brute force until the landscape changes or someone thinks of
// a proper solution.
export function resolveImportInconsistency(json: any) {
  // `json` doesn't inherit from `Object`?
  // Can't use hasOwnProperty for some reason.
  const hasDefaultExport =
    process.env.NODE_ENV === 'test' ? 'default' in json : json.hasOwnProperty('default');
  if (hasDefaultExport) {
    return json.default;
  } else {
    return json;
  }
}
