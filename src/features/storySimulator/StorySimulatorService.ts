import { sendAssetRequest, sendStoryRequest } from './StorySimulatorRequest';
import { ChapterDetail } from './StorySimulatorTypes';

/**
 * List of all folders to fetch S3 assets from
 */
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

/**
 * Request to fetches assets from all S3 folders
 *
 * @param accessToken - staff access token
 * @param folders - S3 folders to fetch from
 * @returns {Promise<string[]>} - full concatenated list of files in the given S3 folders
 */
export async function fetchAssetPaths(accessToken: string = '', folders: string[]) {
  const files = await Promise.all(
    folders.map(async folderName => {
      const files = await fetchFolder(accessToken, folderName);
      return files.length ? files : [`${folderName}`];
    })
  );
  return files.reduce((combinedList, newList) => combinedList.concat(newList), []);
}

/**
 * Request to fetches assets from one S3 folders
 *
 * @param accessToken - staff access token
 * @param folderName - S3 folder to fetch from
 * @returns {Promise<string[]>} - list of files in S3 folder
 */
async function fetchFolder(accessToken: string, folderName: string) {
  const response = await sendAssetRequest(accessToken, folderName, 'GET', {
    'Content-Type': 'application/json'
  });
  return response.status === 200 ? response.json() : [];
}

/**
 * Request to delete an S3 file
 *
 * @param accessToken - staff access token
 * @param assetPath - file path to delete
 * @returns {Promise<string>} - request response
 */
export async function deleteS3File(accessToken: string, assetPath: string) {
  const response = await sendAssetRequest(accessToken, assetPath, 'DELETE');
  const message = await response.text();
  return message || 'Successfully Deleted';
}

/**
 * Request to upload a group of files into a chosen S3 folder
 *
 * @param accessToken - staff access token
 * @param fileList - the files to upload
 * @param folderName - which folder to upload to
 * @returns {Promise<string>} - Request responses, concatentated together
 */
export async function uploadAssets(accessToken: string, fileList: FileList, folderName: string) {
  const responses = await Promise.all(
    Array.from(fileList).map(async file => {
      const response = await uploadAsset(accessToken, file, folderName);
      return file.name + ' => ' + response;
    })
  );
  return responses.join('\n');
}

/**
 * Uploads just one file into S3 folder
 *
 * @param accessToken - staff access token
 * @param file - file to delete
 * @param folderName - file path to delete
 * @returns {Promise<string>} - Request response
 */
export async function uploadAsset(accessToken: string, file: File, folderName: string) {
  const formData = new FormData();
  formData.set('upload', file);

  const response = await sendAssetRequest(
    accessToken,
    `${folderName}/${file.name}`,
    'POST',
    {},
    { body: formData, mode: 'cors' }
  );

  return response ? response.text() : '';
}

/**
 * Fetches all chapters from the backend
 *
 * @param accessToken - staff access token
 * @returns {Promise<object[]>} - All the chapter objects in a list
 */
export async function fetchChapters(accessToken: string = ''): Promise<ChapterDetail[]> {
  const response = await sendStoryRequest(accessToken, '', 'GET');
  return response.status === 200 ? response.json() : [];
}
const openAt = new Date();
const closeAt = new Date();
closeAt.setMonth(closeAt.getMonth() + 2);

/**
 * Creates a chapter
 *
 * @param accessToken - staff access token
 * @returns {Promise<string>} - Response
 */
export async function createChapterRequest(accessToken: string = '') {
  const response = await sendStoryRequest(
    accessToken,
    '',
    'POST',
    {
      'Content-Type': 'application/json'
    },
    {
      body: JSON.stringify({
        openAt: openAt.toISOString(),
        closeAt: closeAt.toISOString(),
        title: 'Some title',
        filenames: [],
        imageUrl: '...',
        isPublished: false
      })
    }
  );
  return response.status === 200 ? 'Chapter successfully created' : response.text();
}
