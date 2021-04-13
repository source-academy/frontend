import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as QueryString from 'query-string';
import { useEffect, useState } from 'react';

import Constants from '../../commons/utils/Constants';
import * as GitHubUtils from '../../features/github/GitHubUtils';

/**
 * The page that the user is redirected to after they have approved the app through GitHub.
 * This page will complete the OAuth workflow by sending the access code the back-end to retrieve the auth-token.
 * The auth-token is then broadcasted back to the main browser page.
 */
export function GitHubCallback() {
  const [displayElement, setDisplayElement] = useState(
    <div className="Playground bp3-dark">{'Attempting GitHub authentication...'}</div>
  );

  useEffect(() => {
    const currentAddress = window.location.search;
    const accessCode = GitHubUtils.grabAccessCodeFromURL(currentAddress);

    const clientId = GitHubUtils.getClientId();
    const backendLink = Constants.githubOAuthProxyUrl;

    if (accessCode === '') {
      setDisplayElement(
        createDeath(
          "We couldn't authenticate you with GitHub",
          'Access code not found in callback URL. Please try again or contact the website administrator.'
        )
      );
      return;
    }

    if (clientId === '') {
      setDisplayElement(
        createDeath(
          "We couldn't authenticate you with GitHub",
          'Client ID not included with deployment. Please try again or contact the website administrator.'
        )
      );
      return;
    }

    const messageBody = QueryString.stringify({
      code: accessCode,
      clientId: clientId
    });

    retrieveAuthTokenUpdatePage(backendLink, messageBody, setDisplayElement);
  }, []);

  return displayElement;
}

async function retrieveAuthTokenUpdatePage(
  backendLink: string,
  messageBody: string,
  setDisplayElement: (value: React.SetStateAction<JSX.Element>) => void
) {
  const responseObject = await GitHubUtils.exchangeAccessCodeForAuthTokenContainingObject(
    backendLink,
    messageBody
  );

  let response: any;

  try {
    // This line might throw syntax error if the payload received is in the wrong format
    response = await responseObject.json();

    if (typeof response.access_token === 'undefined') {
      throw new Error('Access Token not found in payload');
    }
  } catch (err) {
    setDisplayElement(
      createDeath(
        "We couldn't authenticate you with GitHub",
        'Connection with server was denied, or incorrect payload received. Please try again or contact the website administrator.'
      )
    );
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

function createDeath(title: string, description: string) {
  return (
    <div className={classNames('NoPage', Classes.DARK)}>
      <NonIdealState icon={IconNames.ERROR} title={title} description={description} />
    </div>
  );
}

export default GitHubCallback;
