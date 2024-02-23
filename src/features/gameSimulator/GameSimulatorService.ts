import _ from 'lodash';

import { sendAdminStoryRequest, sendAssetRequest, sendStoryRequest } from './GameSimulatorRequest';
import { ChapterDetail } from './GameSimulatorTypes';

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

export function obtainTextAssets(assetPaths: string[]) {
  return assetPaths
    .filter(assetPath => assetPath.startsWith('stories') && assetPath.endsWith('txt'))
    .map(
      assetPath => assetPath.slice(8) // remove /stories
    );
}

export const fetchTextAssets = async () => obtainTextAssets(await fetchFolder('stories'));

/**
 * Request to fetches assets from all S3 folders
 *
 * @returns {Promise<string[]>} - full concatenated list of files in the given S3 folders
 */
export async function fetchAssetPaths(): Promise<string[]> {
  const files = await Promise.all(
    s3AssetFolders.map(async folderName => {
      const files = await fetchFolder(folderName);
      return files.length ? files : [`${folderName}`];
    })
  );
  return files.reduce((combinedList, newList) => combinedList.concat(newList), []);
}

/**
 * Request to fetches assets from one S3 folders
 *
 * @param folderName - S3 folder to fetch from
 * @returns {Promise<string[]>} - list of files in S3 folder
 */
async function fetchFolder(folderName: string) {
  const response = await sendAssetRequest(folderName, 'GET', {
    'Content-Type': 'application/json'
  });
  return response.status === 200 ? response.json() : [];
}

/**
 * Request to delete an S3 file
 *
 * @param assetPath - file path to delete
 * @returns {Promise<string>} - request response
 */
export async function deleteS3File(assetPath: string) {
  const response = await sendAssetRequest(assetPath, 'DELETE');
  const message = await response.text();
  return message || 'Successfully Deleted';
}

/**
 * Request to upload a group of files into a chosen S3 folder
 *
 * @param fileList - the files to upload
 * @param folderName - which folder to upload to
 * @returns {Promise<string>} - Request responses, concatentated together
 */
export async function uploadAssetsToS3(fileList: FileList, folderName: string) {
  const responses = await Promise.all(
    Array.from(fileList).map(async file => {
      const response = await uploadAssetToS3(file, folderName);
      return file.name + ' => ' + response;
    })
  );
  return responses.join('\n');
}

/**
 * Uploads just one file into S3 folder
 *
 * @param file - file to delete
 * @param folderName - file path to delete
 * @returns {Promise<string>} - Request response
 */
export async function uploadAssetToS3(file: File, folderName: string) {
  const formData = new FormData();
  formData.set('upload', file);

  const response = await sendAssetRequest(
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
export async function fetchChapters(): Promise<ChapterDetail[]> {
  const response = await sendStoryRequest('', 'GET');
  const chapterDetails = response.status === 200 ? await response.json() : [];
  return _.sortBy(chapterDetails, (chapterDetail: ChapterDetail) => new Date(chapterDetail.openAt));
}

/**
 * Creates or updates a chapter
 *
 * @returns {Promise<string>} - Response
 */
export async function updateChapterRequest(id: string, body: object) {
  const response = await sendAdminStoryRequest(
    id,
    'POST',
    {
      'Content-Type': 'application/json'
    },
    {
      body: JSON.stringify(body)
    }
  );
  return response.status === 200 ? 'Chapter successfully created/updated' : response.text();
}

/**
 * Creates a chapter
 *
 * @returns {Promise<string>} - Response
 */
export async function deleteChapterRequest(id: string) {
  const response = await sendAdminStoryRequest(id, 'DELETE');
  return response.status === 204 ? 'Chapter successfully deleted' : response.text();
}
