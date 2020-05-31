import * as AWS from 'aws-sdk';

import { accessKeyId, region, s3Folder, secretAccessKey } from './StorySimulatorConstants';
import { StoryDetail } from './StorySimulatorTypes';

AWS.config.update({ accessKeyId, secretAccessKey, region });
const s3 = new AWS.S3();

const params = {
  Bucket: 'source-academy-assets',
  Delimiter: '',
  Prefix: s3Folder
};

/**
 * Fetches stories
 */
export async function fetchStories() {
  const response = await s3.listObjects(params).promise();
  const stories = response.Contents || [];
  return (stories as any) as StoryDetail[];
}
