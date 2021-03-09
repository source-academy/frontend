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

    const messageBody =
      encodeURIComponent('code') +
      '=' +
      encodeURIComponent(accessCode) +
      '&' +
      encodeURIComponent('clientId') +
      '=' +
      encodeURIComponent(clientId);

    if (accessCode == null) {
      setMessage('Access code returned null');
      return;
    }

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
          // POST back to main thread
          broadcastChannel.postMessage(res.access_token);
          setMessage('Access Token: ' + res.access_token);
        } else {
          // Yeet skeet mageet
          setMessage('Request denied');
        }
      });
  }, []);

  return <div>{message}</div>;
}

export default GitHubCallback;
