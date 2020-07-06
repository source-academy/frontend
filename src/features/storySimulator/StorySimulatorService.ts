import Constants from 'src/commons/utils/Constants';

export const s3AssetFolders = ['locations', 'objects', 'images', 'avatars', 'ui'];

export async function fetchAssetPaths(accessToken: string) {
  const files = await Promise.all(
    s3AssetFolders.map(async folderName => {
      const files = await fetchFolder(accessToken, folderName);
      return files.length ? files : [`${folderName}`];
    })
  );
  return files.reduce((combinedList, newList) => combinedList.concat(newList), []);
}

async function fetchFolder(accessToken: string, folderName: string) {
  try {
    const headers = createHeaders(accessToken);
    headers.append('Content-Type', 'application/json');

    const response = await fetch(Constants.backendUrl + `/v1/assets/${folderName}`, {
      method: 'GET',
      headers
    });
    const message = await response.json();
    return message;
  } catch {
    return [];
  } finally {
  }
}

export async function uploadAsset(
  accessToken: string,
  file: Blob,
  folderName: string,
  fileName: string
) {
  try {
    const formData = new FormData();
    formData.set('upload', file);

    const headers = createHeaders(accessToken);
    headers.append('Content-Type', 'multipart/form-data');

    const response = await fetch(Constants.backendUrl + `/v1/assets/${folderName}/${fileName}`, {
      method: 'POST',
      body: formData,
      headers: createHeaders(accessToken),
      mode: 'cors'
    });

    alert(await response.text());
    return response;
  } finally {
  }
}

function createHeaders(accessToken: string): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accessToken}`);
  return headers;
}
