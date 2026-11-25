/**
 * The text that the REPL shows for the value of a run, which an evaluator sends as it is: strings
 * quoted, `null` and `undefined` spelled out, arrays as `[a, b]` (a missing slot of a sparse array
 * as `undefined`), plain objects as `{key: value}`, a structure that contains itself cut off with
 * `...<circular>`, and one nested deeper than {@link MAX_DEPTH} cut off with `...<truncated>`
 * (js-slang's own limit), so that a deep result cannot exhaust the stack.
 *
 * Deliberately simple and the same for every language: an evaluator that wants a value shown in its
 * own notation sends it in that notation.
 */
const MAX_DEPTH = 100;

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
  if (ancestors.size >= MAX_DEPTH) {
    return '...<truncated>';
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return `[${Array.from(value, item => format(item, ancestors)).join(', ')}]`;
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
