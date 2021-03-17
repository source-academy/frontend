import { useEffect, useState } from 'react';

import { URIField } from '../../features/github/GitHubClasses';
import { encodeAsURL } from '../../features/github/GitHubUtils';

export type GitHubCallbackProps = {
  clientID?: string;
  exchangeAccessCodeForAuthTokenContainingObject: (
    backendLink: string,
    messageBody: string
  ) => Promise<Response>;
  grabAccessCodeFromURL: (currentURLAddress: string) => string;
};

/**
 * The page that the user is redirected to after they have approved the app through GitHub.
 * This page will complete the OAuth workflow by sending the access code the back-end to retrieve the auth-token.
 * The auth-token is then broadcasted back to the main browser page.
 */
export function GitHubCallback(props: GitHubCallbackProps) {
  const [message, setMessage] = useState('You have reached the GitHub callback page');

  // Destructure the properties outside of 'useEffect'
  const clientId = props.clientID || '';
  const grabAccessCodeFromURL = props.grabAccessCodeFromURL;
  const exchangeAccessCodeForAuthTokenContainingObject =
    props.exchangeAccessCodeForAuthTokenContainingObject;

  useEffect(() => {
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

    // Create message body to be sent to back-end microservice
    const messageBody = encodeAsURL([
      new URIField('code', accessCode),
      new URIField('clientId', clientId)
    ]);

    exchangeAccessCodeForAuthTokenContainingObject(backendLink, messageBody)
      .then(res => res.json())
      .then(res => {
        const requestSuccess = typeof res.access_token != 'undefined';

        if (requestSuccess) {
          // Send auth token back to the main browser page
          const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');
          broadcastChannel.postMessage(res.access_token);

          setMessage('Log-in successful! This window will close soon.');
          setTimeout(() => {
            window.close();
          }, 3000);
        } else {
          setMessage(
            'Connection with server was denied. Please try again or contact the website administrator.'
          );
        }
      });
  }, [clientId, grabAccessCodeFromURL, exchangeAccessCodeForAuthTokenContainingObject]);

  return <div>{message}</div>;
}

export default GitHubCallback;
