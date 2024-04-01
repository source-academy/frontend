import { Button } from '@blueprintjs/core';
import _ from 'lodash';
import { assessmentFullPathRegex } from 'src/features/academy/AcademyTypes';
import { store } from 'src/pages/createStore';

import { Tokens } from '../application/types/SessionTypes';
import { postRefresh } from '../sagas/RequestsSaga';
import { MockResponse } from './__tests__/RequestHelper';
import { actions } from './ActionsHelper';
import Constants from './Constants';
import { dismiss, showWarningMessage } from './notifications/NotificationsHelper';

/**
 * @property accessToken - backend access token
 * @property errorMessage - message to showWarningMessage on failure
 * @property body - request body, for HTTP POST
 * @property noContentType - set to true when sending multipart data
 * @property noHeaderAccept - if Accept: application/json should be omitted
 * @property refreshToken - backend refresh token
 */
type RequestOptions = {
  accessToken?: string;
  errorMessage?: string;
  body?: object;
  noContentType?: boolean;
  noHeaderAccept?: boolean;
  refreshToken?: string;
  withCredentials?: boolean;
};

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

let refreshingTokensPromise: Promise<Tokens | null> | undefined;

/**
 * @returns {(Response|null)} Response if successful, otherwise null.
 *
 * If response status is 401 Unauthorized, this function will attempt to
 * refresh the JWT tokens before trying the API call again.
 *
 * If user is still unauthorized after refresh token flow:
 * - User in non-AssessmentWorkspace page: perform force logout
 * - User in AssessmentWorkspace page: prompt the user to manually save their work; does not force logout
 *
 * NOTE: If multiple API calls are made with an expired access token, only one refresh token flow will be made.
 * All these API calls will then be retried thereafter.
 */
export const request = async (
  path: string,
  method: RequestMethod,
  opts: RequestOptions,
  rawUrl?: string
): Promise<Response | null> => {
  const fetchOptions = generateApiCallHeadersAndFetchOptions(method, opts);

  try {
    const url = rawUrl ? rawUrl : `${Constants.backendUrl}/v2/${path}`;
    const resp = await fetch(url, fetchOptions);
    if (resp.ok || resp.status === 409) {
      return resp;
    }

    // Non-unauthorized errors (these don't need to trigger refresh token flow)
    if (resp.status !== 401) {
      showWarningMessage(opts.errorMessage ? opts.errorMessage : getResponseErrorMessage(resp));
      return null;
    }

    // Unauthorized errors (trigger refresh token flow)
    if (!opts.refreshToken) {
      // If no refreshToken passed in, we are in `postRefresh` itself AND the refresh token flow failed
      // (i.e. invalid refresh token sent)
      return null;
    }

    // Perform refresh token flow before retrying API call.
    // If refresh token flow or retried API call 401s again, determine whether to force logout.
    try {
      if (!refreshingTokensPromise) {
        refreshingTokensPromise = postRefresh(opts.refreshToken);
      }

      // Blocks other API calls that failed due to expired access token, while performing a single refresh token flow
      const newTokens = await refreshingTokensPromise;
      if (!newTokens) {
        throw Error('Invalid refreshed token');
      }

      store.dispatch(actions.setTokens(newTokens));
      const updatedFetchOptions = _.cloneDeep(fetchOptions);
      updatedFetchOptions.headers.set('Authorization', `Bearer ${newTokens.accessToken}`);

      const retriedResp = await fetch(`${Constants.backendUrl}/v2/${path}`, updatedFetchOptions);
      if (retriedResp.ok) {
        return retriedResp;
      }

      if (retriedResp.status === 401) {
        // Something went wrong with the refreshed access token (this should never happen)
        throw Error('Invalid refreshed access token');
      }

      showWarningMessage(
        opts.errorMessage ? opts.errorMessage : getResponseErrorMessage(retriedResp)
      );
      return null;
    } catch (err) {
      // Refresh token flow or retried API call 401s again. Force logout in non-AssessmentWorkspace routes.
      const isAssessmentUrl = !!window.location.pathname.match(assessmentFullPathRegex);

      if (isAssessmentUrl) {
        showWarningMessage(
          promptReloginMessage,
          -1, // force toast to not timeout
          userSessionExpiredNotificationKey
        );
      } else {
        store.dispatch(actions.logOut());
        showWarningMessage(autoLogoutMessage, undefined, userSessionExpiredNotificationKey);
      }

      return null;
    } finally {
      refreshingTokensPromise = undefined;
    }
  } catch (err) {
    // `fetch` throws only when network error is encountered (https://developer.mozilla.org/en-US/docs/Web/API/fetch)
    showWarningMessage(networkErrorMessage, undefined, networkErrorNotificationKey);
    return null;
  }
};

export const generateApiCallHeadersAndFetchOptions = (
  method: RequestMethod,
  opts: RequestOptions
) => {
  const headers = new Headers();
  if (!opts.noHeaderAccept) {
    headers.append('Accept', 'application/json');
  }
  if (opts.accessToken) {
    headers.append('Authorization', `Bearer ${opts.accessToken}`);
  }
  const fetchOpts: {
    method: RequestMethod;
    headers: Headers;
    body?: any;
    credentials?: RequestCredentials;
  } = { method, headers };
  if (opts.body) {
    if (opts.noContentType) {
      // Content Type is not needed for sending multipart data
      fetchOpts.body = opts.body as any;
    } else {
      headers.append('Content-Type', 'application/json');
      fetchOpts.body = JSON.stringify(opts.body);
    }
  }
  if (opts.withCredentials) {
    fetchOpts.credentials = 'include';
  }

  return fetchOpts;
};

export const userSessionExpiredNotificationKey = 'userSessionExpired';
export const networkErrorNotificationKey = 'networkError';
export const autoLogoutMessage = 'Please login again';
export const promptReloginMessage = (
  <div>
    User session expired. Please copy your work and{' '}
    <Button
      onClick={() => {
        store.dispatch(actions.logOut());
        dismiss(userSessionExpiredNotificationKey);
      }}
    >
      Relogin
    </Button>
  </div>
);
export const networkErrorMessage = 'Error while communicating with backend; check your network?';
export const getResponseErrorMessage = (resp: Response | MockResponse) =>
  `Error while communicating with backend: ${resp.status} ${resp.statusText}`;
