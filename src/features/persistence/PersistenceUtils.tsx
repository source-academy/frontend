/**
 * Calls Google useinfo API to get user's profile data, specifically email, using accessToken.
 * If email field does not exist in the JSON response (invalid access token), will return undefined.
 * Used with handleUserChanged to handle login.
 * @param accessToken GIS access token
 * @returns string if email field exists in JSON response, undefined if not
 */
export async function getUserProfileDataEmail(accessToken: string): Promise<string | undefined> {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers
  });
  const data = await response.json();
  return data.email;
}
