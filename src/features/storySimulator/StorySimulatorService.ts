import { createAssetRequest } from './StorySimulatorRequest';

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
  const response = await createAssetRequest(accessToken, folderName, 'GET', {
    'Content-Type': 'application/json'
  });
  return response ? response.json() : [];
}

export async function deleteS3File(accessToken: string, assetPath: string) {
  if (
    window.confirm(`Are you sure you want to delete ${assetPath}? There is no undoing this action!`)
  ) {
    console.log('Deleted');
  } else {
    console.log('Whew');
  }
  const response = await createAssetRequest(accessToken, assetPath, 'DELETE');
  return response ? response.text() : 'Unknown response';
}

export async function uploadAssets(accessToken: string, fileList: FileList, folderName: string) {
  const responses = await Promise.all(
    Array.from(fileList).map(async file => {
      const response = await uploadAsset(accessToken, file, folderName, file.name);
      return file.name + ' => ' + response;
    })
  );
  return responses.join('\n');
}

async function uploadAsset(accessToken: string, file: Blob, folderName: string, fileName: string) {
  if (!file.type.startsWith('image') && !file.type.startsWith('audio')) {
    return 'Only images and audio allowed.';
  }
  const formData = new FormData();
  formData.set('upload', file);

  const response = await createAssetRequest(
    accessToken,
    `${folderName}/${fileName}`,
    'POST',
    { 'Content-Type': 'multipart/form-data' },
    { body: formData }
  );

  return response ? response.json() : [];
}
