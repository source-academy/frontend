/**
 * The text that the REPL shows for the value of a run, which an evaluator sends as it is: strings
 * quoted, `null` and `undefined` spelled out, arrays as `[a, b]`, plain objects as `{key: value}`,
 * and a structure that contains itself cut off with `...<circular>`.
 *
 * Deliberately simple and the same for every language: an evaluator that wants a value shown in its
 * own notation sends it in that notation.
 */
export function formatValue(value: unknown): string {
  return format(value, new Set());
}

function format(value: unknown, ancestors: Set<object>): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value !== 'object') {
    return String(value);
  }
  if (ancestors.has(value)) {
    return '...<circular>';
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return `[${value.map(item => format(item, ancestors)).join(', ')}]`;
    }
    if (Object.getPrototypeOf(value) === Object.prototype) {
      const entries = Object.entries(value).map(
        ([key, item]) => `${key}: ${format(item, ancestors)}`,
      );
      return `{${entries.join(', ')}}`;
    }
    return String(value);
  } finally {
    ancestors.delete(value);
  }
}
