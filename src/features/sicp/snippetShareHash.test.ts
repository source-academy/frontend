import { compressToEncodedURIComponent } from 'lz-string';
import { describe, expect, test } from 'vitest';

import { snippetShareHash } from './snippetShareHash';

describe('snippetShareHash', () => {
  test('names the language of a snippet whose link names none, by the fields of today', () => {
    expect(snippetShareHash('prgrm=abc', 'source3', 'source3Cse')).toBe(
      'prgrm=abc&language=source&variant=3&evaluator=Cse',
    );
  });

  test('replaces a Source chapter from before the language directory (chap, variant)', () => {
    expect(snippetShareHash('chap=3&variant=default&prgrm=abc', 'source3', 'source3Cse')).toBe(
      'prgrm=abc&language=source&variant=3&evaluator=Cse',
    );
  });

  test('replaces the language that the link names with the selected one', () => {
    expect(
      snippetShareHash('language=python&variant=1&evaluator=Py2js&prgrm=abc', 'python2', null),
    ).toBe('prgrm=abc&language=python&variant=2');
  });

  test('leaves the rest of the link as it is, including the characters a query parser would change', () => {
    // `+` is in the alphabet of lz-string's URL-safe encoding, and a parser reads it as a space.
    const program = compressToEncodedURIComponent('const x = "a+b" + 1;'.repeat(20));
    expect(program).toContain('+');
    const hash = `chap=1&files=${program}&tabs=A+B&isFolder=false`;
    expect(snippetShareHash(hash, 'source1', null)).toBe(
      `files=${program}&tabs=A+B&isFolder=false&language=source&variant=1`,
    );
  });

  test('a language without a variant has none', () => {
    expect(snippetShareHash('prgrm=abc', 'pythonFull', 'pythonFullPvml')).toBe(
      'prgrm=abc&language=pythonFull&evaluator=Pvml',
    );
  });

  test("is the snippet's own link while no language is selected (the directory is loading)", () => {
    expect(snippetShareHash('chap=2&prgrm=abc', null, null)).toBe('chap=2&prgrm=abc');
    expect(snippetShareHash('language=python&variant=1&prgrm=abc', null, null)).toBe(
      'language=python&variant=1&prgrm=abc',
    );
  });

  test('does not mistake the name of another field for a language field', () => {
    expect(snippetShareHash('chapter=1&languages=x&prgrm=abc', 'source1', null)).toBe(
      'chapter=1&languages=x&prgrm=abc&language=source&variant=1',
    );
  });
});
