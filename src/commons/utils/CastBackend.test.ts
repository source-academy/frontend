import { describe, expect, test } from 'vitest';

import { castLibrary } from './CastBackend';

const backendLibrary = (extra: object = {}) => ({
  chapter: 3,
  execTimeMs: null,
  external: { name: 'none', symbols: [] },
  globals: { x: '1' },
  language: null,
  evaluator: null,
  ...extra,
});

describe('castLibrary', () => {
  test('keeps the language and evaluator that the backend sends (backend#1387)', () => {
    const lib = castLibrary(backendLibrary({ language: 'ocaml', evaluator: 'ocamlJsOfOCaml' }));
    expect(lib.language).toBe('ocaml');
    expect(lib.evaluator).toBe('ocamlJsOfOCaml');
  });

  test('a question without them has none, not null', () => {
    const lib = castLibrary(backendLibrary());
    expect(lib.language).toBeUndefined();
    expect(lib.evaluator).toBeUndefined();
  });

  test('still casts the rest', () => {
    const lib = castLibrary(backendLibrary());
    expect(lib.external.name).toBe('NONE');
    expect(lib.execTimeMs).toBeUndefined();
    expect(lib.globals).toEqual([['x', 1]]);
  });
});
