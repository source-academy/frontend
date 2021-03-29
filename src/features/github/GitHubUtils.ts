import { store } from '../../pages/createStore';
import { URIField } from './GitHubClasses';

/**
 * Exchanges the Access Code with the back-end to receive an Auth-Token
 *
 * @param {string} backendLink The address where the back-end microservice is deployed
 * @param {string} messageBody The message body. Must be URL-encoded
 * @return {Promise<Response>} A promise for a HTML response with an 'auth_token' field
 */
export async function exchangeAccessCodeForAuthTokenContainingObject(
  backendLink: string,
  messageBody: string
): Promise<Response> {
  return await fetch(backendLink, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: messageBody
  });
}

/**
 * Grabs the value of the field 'code' of the URL address passed as an argument
 *
 * @param {string} currentURLAddress The current address of the current browser window
 * @return {string} The access code
 */
export function grabAccessCodeFromURL(currentURLAddress: string): string {
  const urlParams = new URLSearchParams(currentURLAddress);
  const accessCode = urlParams.get('code') || '';
  return accessCode;
}

/**
 * Converts an array of URI fragments into a single URL-encoded string
 *
 * @param {URIField[]} messageBodyPrototype An array of URIFields, each corresponding to a URI fragment
 * @return {string} The URL-encoded string
 */
export function encodeAsURL(messageBodyPrototype: URIField[]): string {
  const uriComponents: string[] = [];

  messageBodyPrototype.forEach(element => {
    const field = element.name || '';

    // We need to check for the edge-case where the value is literally false
    const value = element.value === false ? false : element.value || '';

    uriComponents.push([encodeURIComponent(field), encodeURIComponent(value)].join('='));
  });

  return uriComponents.join('&');
}

/**
 * Returns the Octokit instance saved in session state.
 *
 * This function allows for mocking Octokit behaviour in tests.
 */
export function getGitHubOctokitInstance(): any {
  return store.getState().session.githubOctokitInstance;
}

/**
 * Returns the username used by the user to login to GitHub.
 *
 * This function allows for mocking Octokit behaviour in tests.
 */
export function getGitHubLoginID(): string {
  return store.getState().session.githubLoginID;
}

/**
 * Returns the actual name associated with a GitHub account.
 *
 * This function allows for mocking Octokit behaviour in tests.
 */
export function getGitHubName(): string {
  return store.getState().session.githubName || '';
}

/**
 * Returns the email address associated with a GitHub account.
 *
 * This function allows for mocking Octokit behaviour in tests.
 */
export function getGitHubEmail(): string {
  return store.getState().session.githubEmail || 'no public email provided';
}
