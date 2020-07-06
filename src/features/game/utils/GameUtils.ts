import Constants from 'src/commons/utils/Constants';

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function mapValues<K, V, R>(map: Map<K, V>, fn: (value: V, key?: K) => R) {
  const newMap = new Map<K, R>();
  map.forEach((value: V, key: K) => {
    const result: R = fn(value, key);
    newMap.set(key, result);
  });
  return newMap;
}

export function limitNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function createMapWithKey<K, V>(list: any[], id: string) {
  const newMap = new Map<K, any>();

  list.forEach(object => {
    newMap.set(object[id], object);
  });

  return newMap;
}

export function convertPathToS3(localFileName: string) {
  return Constants.backendUrl + '/ui' + localFileName.slice(9); // remove "../assets"
}
