import { useEffect, useState } from 'react';

export function GitHubCallback() {
  const [message, setMessage] = useState('You have reached the GitHub callback page');

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');

    const backendLink = 'https://api2.sourceacademy.nus.edu.sg/github_oauth';

    const currentAddress = window.location.search;
    const urlParams = new URLSearchParams(currentAddress);
    const accessCode = urlParams.get('code') || '';

    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID || '';

    if (accessCode === '') {
      setMessage(
        'Access code not found in callback URL. Please try again or contact the website administrator.'
      );
      return;
    }

    if (clientId === '') {
      setMessage(
        'Client ID not included with deployment. Please contact the website administrator.'
      );
      return;
    }

    const messageBody = [
      [encodeURIComponent('code'), encodeURIComponent(accessCode)].join('='),
      [encodeURIComponent('clientId'), encodeURIComponent(clientId)].join('=')
    ].join('&');

    fetch(backendLink, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: messageBody
    })
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
  }, []);

  return <div>{message}</div>;
}

export default GitHubCallback;
