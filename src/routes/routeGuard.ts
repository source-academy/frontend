import { LoaderFunctionArgs, redirect, RouteObject } from 'react-router';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { store } from 'src/pages/createStore';

type RouteFilter = boolean | ((state: OverallState) => boolean);

const routeGuard = (
  route: RouteObject,
  allowConditions: Array<[RouteFilter, string?]> = []
): RouteObject => {
  const boolFilters: Array<[(state: OverallState) => boolean, string]> = allowConditions.map(
    ([condition, path = '/']) => [
      typeof condition === 'boolean' ? () => condition : condition,
      path
    ]
  );
  return {
    ...route,
    loader: (args: LoaderFunctionArgs) => {
      const state = store.getState();
      for (const [filter, fallbackRoute] of boolFilters) {
        if (!filter(state)) {
          return redirect(fallbackRoute);
        }
      }
      if (!route.loader) {
        return null;
      }
      return route.loader(args);
    }
  };
};

export class GuardedRoute {
  constructor(
    private route: RouteObject,
    private filters?: Array<[RouteFilter, string?]>
  ) {
    this.route = route;
    this.filters = filters ?? [];
  }

  check(condition: RouteFilter, fallbackRoute = '/') {
    this.filters!.push([condition, fallbackRoute]);
    return this;
  }

  build(): RouteObject {
    return routeGuard(this.route, this.filters);
  }
}
