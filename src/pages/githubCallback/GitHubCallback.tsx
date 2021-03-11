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

export function GitHubCallback(props: GitHubCallbackProps) {
  const [message, setMessage] = useState('You have reached the GitHub callback page');

  const clientId = props.clientID || '';
  const grabAccessCodeFromURL = props.grabAccessCodeFromURL;
  const exchangeAccessCodeForAuthTokenContainingObject =
    props.exchangeAccessCodeForAuthTokenContainingObject;

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');

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

    const messageBody = encodeAsURL([
      new URIField('code', accessCode),
      new URIField('clientId', clientId)
    ]);

    exchangeAccessCodeForAuthTokenContainingObject(backendLink, messageBody)
      .then(res => res.json())
      .then(res => {
        const requestSuccess = typeof res.access_token != 'undefined';

        if (requestSuccess) {
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
