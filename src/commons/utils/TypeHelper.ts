export type MaybePromise<T, U = T> = T extends Promise<infer V> ? V : U;

export type PromiseResolveType<T> = MaybePromise<T, never>;

export type AsyncReturnType<T extends (...args: any) => any> = PromiseResolveType<ReturnType<T>>;

export type PropsType<T extends React.Component> = T extends React.Component<infer P> ? P : never;

export type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

/* =========================================
 * Utility types for tuple type manipulation
 * ========================================= */

/** Creates a new tuple type with the first element of T removed. */
export type RemoveFirst<T extends any[]> = T extends [any, ...infer U] ? U : T;
/** Creates a new tuple type with the first N elements of T removed. */
export type RemoveFirstN<
  T extends any[],
  N extends number,
  Carry extends any[] = []
> = Carry['length'] extends N ? T : RemoveFirstN<RemoveFirst<T>, N, [any, ...Carry]>;
/** Creates a new tuple type with the first N elements of T. */
export type FirstN<
  T extends any[],
  N extends number,
  Counter extends any[] = []
> = Counter['length'] extends N ? Counter : FirstN<RemoveFirst<T>, N, [...Counter, T[0]]>;

/** Creates a new tuple type with the last element of T removed. */
export type RemoveLast<T extends any[]> = T extends [...infer U, any] ? U : T;
/** Creates a new tuple type with the last N elements of T. */
export type LastN<
  T extends any[],
  N extends number,
  Counter extends any[] = []
> = Counter['length'] extends N
  ? Counter
  : LastN<RemoveLast<T>, N, [[never, ...T][T['length']], ...Counter]>;

/** Creates a new tuple type with the type at index I of T replaced with S. */
export type ReplaceTypeAtIndex<T extends any[], I extends number, S> = [
  ...FirstN<T, I>,
  S,
  ...RemoveFirst<RemoveFirstN<T, I>>
];

/**
 * Prevents invalid keys from being passed in to an object of the specified type argument.
 * All valid keys are made optional (but still properly typed as optional/non-optional)
 * to support use cases with multiple `assertType` calls from spreading subsequent objects.
 *
 * Leverages TypeScript's powerful type inference to return a properly typed object
 * by acting as a "middleware" to verify the type while still respecting the original
 * type of the object.
 */
export const assertType =
  <S extends Record<string, any>>() =>
  // Currying to allow for TS 4.7 instantion expressions to make this generic function specific
  <
    T extends {
      // Do not allow keys that are not in S
      [key in Exclude<keyof T, keyof S>]: never;
    } & {
      // Keys of S should be optional to allow extension
      [key in keyof S]?: S[key];
    } & {
      // But if the key is defined in T, despite being a partial
      // type, the value of T[key] must not be undefined
      // unless undefined is allowed in S. Similar behavior to
      // `--exactOptionalPropertyTypes` flag in tsconfig.json,
      // but this allows us to only enforce it when we want to.
      [key in keyof T]: key extends keyof S ? S[key] : never;
    } = any
  >(
    obj: T
    // Keep the original type as inferred by TS
  ): T =>
    obj;
