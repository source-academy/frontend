import * as qs from 'query-string';
import { isArray } from 'util';

export interface IParsedQuery {
  [key: string]: string;
}

/**
 * Parse a query string into an object.
 *
 * This is a wrapper for query-string that disables array and null parsing (so
 * the object has only strings).
 */
export function parseQuery(query: string): IParsedQuery {
  const parsed = qs.parse(query);
  for (const [key, val] of Object.entries(parsed)) {
    if (isArray(val)) {
      parsed[key] = val.join(',');
    } else if (val === null) {
      delete parsed[key];
    }
  }

  return parsed as IParsedQuery;
}
