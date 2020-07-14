import { createAssetRequest, createStoryRequest } from './StorySimulatorRequest';

export const s3AssetFolders = [
  'locations',
  'objects',
  'images',
  'avatars',
  'ui',
  'sfx',
  'bgm',
  'stories'
];

export async function fetchAssetPaths(accessToken: string = '', folders: string[]) {
  const files = await Promise.all(
    folders.map(async folderName => {
      const files = await fetchFolder(accessToken, folderName);
      return files.length ? files : [`${folderName}`];
    })
  );
  return files.reduce((combinedList, newList) => combinedList.concat(newList), []);
}

async function fetchFolder(accessToken: string, folderName: string) {
  const response = await createAssetRequest(accessToken, folderName, 'GET', {
    'Content-Type': 'application/json'
  });
  return response.status === 200 ? response.json() : [];
}

export async function deleteS3File(accessToken: string, assetPath: string) {
  const response = await createAssetRequest(accessToken, assetPath, 'DELETE');
  const message = await response.text();
  return message || 'Successfully Deleted';
}

export async function uploadAssets(
  accessToken: string,
  fileList: FileList,
  folderName: string,
  types: string[]
) {
  const responses = await Promise.all(
    Array.from(fileList).map(async file => {
      const response = await uploadAsset(accessToken, file, folderName, file.name, types);
      return file.name + ' => ' + response;
    })
  );
  return responses.join('\n');
}

export async function uploadAsset(
  accessToken: string,
  file: Blob,
  folderName: string,
  fileName: string,
  types: string[]
) {
  if (types.every(type => !file.type.startsWith(type))) {
    return `Allowed types are ${types.join(',')}`;
  }
  const formData = new FormData();
  formData.set('upload', file);

  const response = await createAssetRequest(
    accessToken,
    `${folderName}/${fileName}`,
    'POST',
    {},
    { body: formData, mode: 'cors' }
  );

  return response ? response.text() : '';
}

export async function fetchChapters(accessToken: string = '') {
  const response = await createStoryRequest(accessToken, '', 'GET');
  return response.status === 200 ? response.json() : [];
}
