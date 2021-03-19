import * as QueryString from 'query-string';
import { useEffect, useState } from 'react';

import {
  exchangeAccessCodeForAuthTokenContainingObject,
  grabAccessCodeFromURL
} from '../../features/github/GitHubUtils';

/**
 * The page that the user is redirected to after they have approved the app through GitHub.
 * This page will complete the OAuth workflow by sending the access code the back-end to retrieve the auth-token.
 * The auth-token is then broadcasted back to the main browser page.
 */
export function GitHubCallback() {
  const [message, setMessage] = useState('You have reached the GitHub callback page');

  useEffect(() => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const backendLink = 'https://api2.sourceacademy.nus.edu.sg/github_oauth';

    const currentAddress = window.location.search;
    const accessCode = grabAccessCodeFromURL(currentAddress);

    if (accessCode === '') {
      setMessage(
        'Access code not found in callback URL. Please try again or contact the website administrator.'
      );
      return;
    }

    if (clientId === '') {
      setMessage(
        'Client ID not included with deployment. Please try again or contact the website administrator.'
      );
      return;
    }

    const messageBody = QueryString.stringify({
      code: accessCode,
      clientId: clientId
    });

    retrieveAuthTokenUpdatePage(backendLink, messageBody, setMessage);
  }, []);

  return <div>{message}</div>;
}

async function retrieveAuthTokenUpdatePage(
  backendLink: string,
  messageBody: string,
  setMessage: (value: React.SetStateAction<string>) => void
) {
  const responseObject = await exchangeAccessCodeForAuthTokenContainingObject(
    backendLink,
    messageBody
  );
  const response = await responseObject.json();

  const requestSuccess = typeof response.access_token !== 'undefined';

  if (requestSuccess) {
    // Send auth token back to the main browser page
    const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');
    broadcastChannel.postMessage(response.access_token);

    setMessage('Log-in successful! This window will close soon.');
    setTimeout(() => {
      window.close();
    }, 3000);
  } else {
    setMessage(
      'Connection with server was denied. Please try again or contact the website administrator.'
    );
  }
}

export default GitHubCallback;
