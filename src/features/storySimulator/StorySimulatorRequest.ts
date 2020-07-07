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

    const config = {
      method,
      headers,
      ...requestDetails
    };

    return fetch(Constants.backendUrl + '/v1/assets/' + requestPath, config);
  } finally {
  }
}

export function createHeaders(accessToken: string): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accessToken}`);
  return headers;
}
