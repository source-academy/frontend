import * as AWS from 'aws-sdk';

export async function fetchAssetPathsLocally() {
  const response = await fetch('../../assets/assets.txt');
  const message = await response.text();
  return message.split('\n').map(line => line.slice(0, line.length - 1)) as string[];
}

export const fetchAssetPaths: Promise<string[]> = new Promise(resolve => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'ap-southeast-1'
  });
  console.log(process.env);
  const s3 = new AWS.S3();

  const params = {
    Bucket: 'source-academy-assets',
    Prefix: 'objects'
  };

  s3.listObjects(params, (_: Error, data: any) => {
    resolve((data.Contents.map((item: any) => item.Key) as []) as string[]);
  });
});

// export const fetchAssetPathsLocally = ;
