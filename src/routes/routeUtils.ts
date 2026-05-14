import type { RouteObject } from 'react-router';

export function createRoutes(
  routeMap: Record<
    string,
    RouteObject['lazy']
    // TODO: Uncomment this if we want to add middleware support
    // | [RouteObject['lazy'], ...MiddlewareFunction[]]
  >,
): RouteObject[] {
  return Object.entries(routeMap).map(([path, lazyAndMiddleware]) => {
    if (Array.isArray(lazyAndMiddleware)) {
      const [lazyFn, ...middleware] = lazyAndMiddleware;
      return { path, lazy: lazyFn, middleware };
    }
    const lazyFn = lazyAndMiddleware;
    return { path, lazy: lazyFn };
  });
}
