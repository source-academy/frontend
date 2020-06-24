export async function fetchAssetPathsLocally() {
  const response = await fetch('../../assets/assets.txt');
  const message = await response.text();
  return message.split('\n').map(line => line.slice(0, line.length - 1)) as string[];
}
