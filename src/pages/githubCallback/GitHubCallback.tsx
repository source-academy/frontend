import { Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import qs from 'query-string';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import Constants from '../../commons/utils/Constants';
import { parseQuery } from '../../commons/utils/QueryHelper';
import * as GitHubUtils from '../../features/github/GitHubUtils';

/**
 * The page that the user is redirected to after they have approved the app through GitHub.
 * This page will complete the OAuth workflow by sending the access code the back-end to retrieve the auth-token.
 * The auth-token is then broadcasted back to the main browser page.
 */
const GitHubCallback: React.FC = () => {
  const location = useLocation();
  const accessCode = parseQuery(location.search).code;

  const [state, setState] = useState<'initial' | 'loading' | 'error'>('initial');
  useEffect(() => {
    if (state === 'initial' && Constants.githubClientId && accessCode) {
      setState('loading');
      retrieveAuthTokenUpdatePage(accessCode, Constants.githubClientId, () => setState('error'));
    }
  }, [accessCode, state]);

  if (!Constants.githubClientId) {
    return (
      <Failure title="We couldn't authenticate you with GitHub">
        Client ID not included with deployment. Please try again or contact the website
        administrator.
      </Failure>
    );
  }

  if (!accessCode) {
    return (
      <Failure title="We couldn't authenticate you with GitHub">
        Access code not found in callback URL. Please try again or contact the website
        administrator.
      </Failure>
    );
  }

  return state === 'error' ? (
    <Failure title="We couldn't authenticate you with GitHub">
      Connection with server was denied, or incorrect payload received. Please try again or contact
      the website administrator.
    </Failure>
  ) : (
    <div className={classNames('NoPage', Classes.DARK)}>
      <NonIdealState description="Logging In..." icon={<Spinner size={SpinnerSize.LARGE} />} />
    </div>
  );
};

async function retrieveAuthTokenUpdatePage(
  accessCode: string,
  clientId: string,
  onError: () => void
) {
  const responseObject = await GitHubUtils.exchangeAccessCode(
    Constants.githubOAuthProxyUrl,
    qs.stringify({
      code: accessCode,
      clientId: clientId
    })
  );

  let response: any;

  try {
    // This line might throw syntax error if the payload received is in the wrong format
    response = await responseObject.json();

    if (typeof response.access_token === 'undefined') {
      throw new Error('Access Token not found in payload');
    }
  } catch (err) {
    onError();
    return;
  }

  try {
    // Send auth token back to the main browser page
    const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');
    broadcastChannel.postMessage(response.access_token);
    window.close();
  } catch (err) {
    // This block should not be reached during normal running of code
    // However, BroadcastChannel does not exist in the test environment
  }
}

function Failure({ title, children }: { title: string; children: string }) {
  return (
    <div className={classNames('NoPage', Classes.DARK)}>
      <NonIdealState icon={IconNames.ERROR} title={title} description={children} />
    </div>
  );
}

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = GitHubCallback;
Component.displayName = 'GitHubCallback';

export default GitHubCallback;
