export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function mapValues<K, V, R>(map: Map<K, V>, fn: (value: V, key?: K) => R) {
  const newMap = new Map<K, any>();
  map.forEach((value: V, key: K) => {
    const result: R = fn(value, key);
    newMap.set(key, result);
  });
  return newMap;
}
