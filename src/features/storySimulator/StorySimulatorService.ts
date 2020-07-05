import Constants from 'src/commons/utils/Constants';

export async function fetchAssetPathsLocally() {
  const response = await fetch('../../assets/assets.txt');
  const message = await response.text();
  return message.split('\n').map(line => line.slice(0, line.length - 1)) as string[];
}

export async function fetchAssetPaths() {
  const response = await fetch(Constants.backendUrl + '/v1/assets/locations');
  const message = await response.text();
  return (message as unknown) as string[];
}
