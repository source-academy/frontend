import Constants from 'src/commons/utils/Constants';

export async function createAssetRequest(
  accessToken: string,
  requestPath: string,
  method: string,
  headerConfig: object = {},
  requestDetails: object = {}
) {
  try {
    const headers = createHeaders(accessToken);
    Object.entries(headerConfig).forEach(([key, value]: string[]) => {
      headers.append(key, value);
    });
    const response = await fetch(Constants.backendUrl + '/v1/assets/' + requestPath, {
      method,
      headers,
      ...requestDetails
    });
    if (response.status === 200) {
      return response;
    } else {
      throw new Error(await response.text());
    }
  } catch {
    return;
  } finally {
  }
}

function createHeaders(accessToken: string): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accessToken}`);
  return headers;
}
