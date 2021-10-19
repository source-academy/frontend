export type PromiseResolveType<T> = T extends Promise<infer U> ? U : never;

export type AsyncReturnType<T extends (...args: any) => any> = PromiseResolveType<ReturnType<T>>;

export type PropsType<T extends React.Component> = T extends React.Component<infer P> ? P : never;

export type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];
