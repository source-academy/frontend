export type PromiseResolveType<T> = T extends Promise<infer U> ? U : never;

export type AsyncReturnType<T extends (...args: any) => any> = PromiseResolveType<ReturnType<T>>;
