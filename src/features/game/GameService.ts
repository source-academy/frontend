export async function fetchAssetPaths() {
  const response = await fetch('../../assets/assets.txt');
  const message = await response.text();
  return message.split('\n') as string[];
}
