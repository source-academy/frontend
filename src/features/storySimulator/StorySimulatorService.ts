import Constants from 'src/commons/utils/Constants';

export const s3AssetFolders = ['locations', 'objects', 'images', 'avatars', 'ui', 'sfx', 'bgm'];

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

export async function uploadAssets(accessToken: string, fileList: FileList, folderName: string) {
  const fileArray = [];
  for (let i = 0; i < fileList.length; i++) {
    fileArray.push(fileList[i]);
  }

  const responses = await Promise.all(
    fileArray.map(async file => {
      const response = await uploadAsset(accessToken, file, folderName, file.name);
      return file.name + ' => ' + response;
    })
  );

  alert(responses.join('\n'));
}

async function uploadAsset(accessToken: string, file: Blob, folderName: string, fileName: string) {
  try {
    if (!file.type.startsWith('image') && !file.type.startsWith('audio')) {
      return 'Only images and audio allowed.';
    }
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

    const responseText = await response.text();
    return responseText;
  } finally {
  }
}

function createHeaders(accessToken: string): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accessToken}`);
  return headers;
}
