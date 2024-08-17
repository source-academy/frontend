export type MaybePromise<T, U = T> = T extends Promise<infer V> ? V : U;

export type PromiseResolveType<T> = MaybePromise<T, never>;

export type AsyncReturnType<T extends (...args: any) => any> = PromiseResolveType<ReturnType<T>>;

export type PropsType<T extends React.Component> = T extends React.Component<infer P> ? P : never;

export type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

/**
 * Does union(keyof <member>) for each member of T. This is unlike
 * `keyof T` which would give keyof(union(<member>)).
 * @param T - The union type to extract keys from
 */
export type DistributedKeyOf<T extends Record<any, any>> = T extends any ? keyof T : never;

/**
 * Generates a "set difference" of two types, keeping the properties of T that are not
 * present in S.
 * @param T - The type to extract keys from
 * @param S - The type to compare against
 */
export type Diff<T extends Record<any, any>, S extends Record<any, any>> = Pick<
  T,
  Exclude<keyof T, keyof S>
>;

/**
 * Merges two types together, keeping the properties of T and adding the
 * properties of U that are not present in T.
 * @param T - The first type
 * @param U - The second type (also "universal" set of properties to add to T)
 */
export type Merge<T extends Record<any, any>, U extends Record<any, any>> = T & Diff<U, T>;

// Adapted from https://github.com/piotrwitek/typesafe-actions/blob/a1fe54bb150ac1b935bb9ca78361d2d024d2efaf/src/type-helpers.ts#L117-L130
export type ActionType<T extends Record<string, any>> = {
  [k in keyof T]: ReturnType<T[k]>;
}[keyof T];

// Copied from redux v4
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Omits the index signature `[key: string]: any;` from type `T` */
export type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K]: T[K];
};

/**
 * A true intersection of the properties of types `A` and `B`, unlike the confusingly named
 * "Intersection Types" in TypeScript which uses the `&` operator and are actually unions.
 * This also excludes the index signature from both `A` and `B` automatically.
 */
export type SharedProperties<A, B> = Pick<A, Extract<keyof RemoveIndex<A>, keyof RemoveIndex<B>>>;

/**
 * A type that represents a React component that has an imperative API
 * (i.e. a ref that can be used to call methods on the component). Such
 * components are typically wrapped in `forwardRef` and `useImperativeHandle`.
 */
export type WithImperativeApi<T, C extends React.ComponentType<any> = React.FC> = React.FC<
  React.ComponentProps<C> & React.RefAttributes<T>
>;

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

/**
 * Type safe `Object.keys`
 */
export function objectKeys<T extends string | number | symbol>(obj: Record<T, any>): T[] {
  return Object.keys(obj) as T[];
}

/**
 * Type safe `Object.values`
 */
export function objectValues<T>(obj: Record<any, T>) {
  return Object.values(obj) as T[];
}

/**
 * Type safe `Object.entries`
 */
export function objectEntries<K extends string | number | symbol, V>(
  obj: Partial<Record<K, V>>
): [K, V][] {
  return Object.entries(obj) as [K, V][];
}
