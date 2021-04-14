import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { showWarningMessage } from '../utils/NotificationsHelper';
import { Api, FullRequestParams } from './api';

declare module './api' {
  interface FullRequestParams {
    accessToken?: string;
    refreshToken?: string;
    errorMessage?: string;
    shouldAutoLogout?: boolean;
    shouldRefresh?: boolean;
  }
}

export * from './api';

/**
 * A custom `fetch` function which will attemp to refresh tokens if the initial
 * response status is < 200 or > 299, then attempt a refetch with fresh tokens.
 *
 * If fetch throws an error, or final response has status code < 200 or > 299,
 * this function will cause the user to logout.
 */
export const customFetch = async (
  url: string,
  opts: FullRequestParams
): Promise<Response | null> => {
  if (opts.accessToken) {
    opts.headers!['Authorization'] = `Bearer ${opts.accessToken}`;
  }

  const shouldRefresh = opts.shouldRefresh ?? true;
  const shouldAutoLogout = opts.shouldAutoLogout ?? true;

  const resp = await fetch(url, opts as RequestInit);
  try {
    // response.ok is (200 <= response.status <= 299)
    // response.status of > 299 does not raise error; so deal with in in the try clause

    // Refresh the user's tokens if a response status of 401 was obtained.
    if (shouldRefresh && resp.status === 401) {
      const newTokens = await Cadet.auth.refresh({ refresh_token: opts.refreshToken! });
      const tokens = newTokens.data!;
      store.dispatch(
        actions.setTokens({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        })
      );
      const newOpts = {
        ...opts,
        accessToken: tokens.access_token,
        shouldRefresh: false
      };
      return customFetch(url, newOpts);
    }

    if (!resp.ok && !shouldAutoLogout) {
      // this clause is mostly for SUBMIT_ANSWER; show an error message instead
      // and ask student to manually logout, so that they have a chance to save
      // their answers
      return resp;
    }

    if (!resp.ok) {
      throw new Error('API call failed or got non-OK response');
    }

    return resp;
  } catch (e) {
    // Logout on all errors.
    store.dispatch(actions.logOut());
    showWarningMessage(opts.errorMessage ? opts.errorMessage : 'Please login again.');

    return resp;
  }
};

export const Cadet = new Api({
  baseUrl: Constants.backendUrl + '/v2',
  // Type-casting as `fetch` here, since we know how this function will be called.
  // TODO: `customFetch` can return `Promise<Response | null>`
  customFetch: (customFetch as unknown) as typeof fetch
});
