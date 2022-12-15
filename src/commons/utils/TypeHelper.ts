export type PromiseResolveType<T> = T extends Promise<infer U> ? U : never;

export type AsyncReturnType<T extends (...args: any) => any> = PromiseResolveType<ReturnType<T>>;

export type PropsType<T extends React.Component> = T extends React.Component<infer P> ? P : never;

export type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

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
    } = any
  >(
    obj: T
    // Keep the original type as inferred by TS
  ): T =>
    obj;
