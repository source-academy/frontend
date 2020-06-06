import { createMemoryHistory } from 'history';
import { RouteComponentProps } from 'react-router';

export function mockRouterProps<P>(path: string, params: P): RouteComponentProps<P> {
  const history = createMemoryHistory();
  history.push(path);
  const props: RouteComponentProps<P> = {
    match: {
      isExact: true,
      params,
      path,
      url: window.location.host + path
    },
    location: history.location,
    history,
    staticContext: {}
  };
  return props;
}
