import { Constants } from '../commons/CommonConstants';

/**
 * When called with await in an async function,
 * e.g. "await sleep(5000)", this line delays
 * the next line by that number of milliseconds.
 *
 * @param ms number of milliseconds to delay next line.
 * @returns {Promise} promise which resolves in ms milliseconds.
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a Map with the same keys, but the values
 * are mapped using a specified function
 *
 * Example:
 * mapValues(Map([["a", 1], ["b", 2], ["c", 3]]), (value, key) => 2 * value + key)
 * returns Map([["a", "2a"], ["b", "4b"], ["c", "6c"]])
 *
 * @param map the Map that you'd like to iterate over
 * @param fn the binary function that produces the new
 *           value of the map using (value, key) as input
 * @returns {Map<K, R>} new Map with mapped values
 */
export function mapValues<K, V, R>(map: Map<K, V>, fn: (value: V, key?: K) => R): Map<K, R> {
  const newMap = new Map<K, R>();
  map.forEach((value: V, key: K) => {
    const result: R = fn(value, key);
    newMap.set(key, result);
  });
  return newMap;
}

/**
 * Caps a number to min and max boundary inclusive.
 *
 * @param value the number's value
 * @param min the minimum value of the number
 * @param max the maximum value of the number
 *
 * @returns {number} number which is capped based on boundaries
 */
export function limitNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Appends the s3 file path to a short path name
 *
 * @param filename the short path of a filename
 * @returns {string} new path to file including full s3 link
 */
export function toS3Path(fileName: string) {
  return Constants.assetsFolder + fileName;
}

/**
 * Throws an error when the property is not found.
 *
 * @param object the property that you would like to get
 * @returns {object} the object if it is found.
 * @throws {Error} if object is undefined
 */
export function mandatory<T>(object: T) {
  if (object === undefined) {
    throw new Error('Object not found');
  }
  return (object as T)!;
}
