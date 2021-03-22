import Constants from '../../commons/utils/Constants';

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
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
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
 * Returns the client ID. This function is meant to allow us to mock the client ID.
 *
 * @return {string} The client ID.
 */
export function getClientId(): string {
  return Constants.githubClientId;
}
