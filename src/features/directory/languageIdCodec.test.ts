import { describe, expect, test } from 'vitest';

import {
  joinEvaluatorId,
  joinLanguageId,
  splitEvaluatorId,
  splitLanguageId,
} from './languageIdCodec';

describe('splitLanguageId', () => {
  test('splits a chaptered language id into language and variant', () => {
    expect(splitLanguageId('python2')).toEqual({ language: 'python', variant: '2' });
    expect(splitLanguageId('source1')).toEqual({ language: 'source', variant: '1' });
  });

  test('leaves a non-chaptered language id as-is', () => {
    expect(splitLanguageId('pythonFull')).toEqual({ language: 'pythonFull' });
    expect(splitLanguageId('scheme')).toEqual({ language: 'scheme' });
  });
});

describe('joinLanguageId', () => {
  test('appends the variant when present', () => {
    expect(joinLanguageId('python', '2')).toBe('python2');
  });

  test('returns the language unchanged when there is no variant', () => {
    expect(joinLanguageId('pythonFull', undefined)).toBe('pythonFull');
  });
});

describe('splitEvaluatorId', () => {
  test('strips the language id prefix', () => {
    expect(splitEvaluatorId('python2', 'python2Pvml')).toBe('Pvml');
    expect(splitEvaluatorId('source1', 'source1Default')).toBe('Default');
  });

  test('returns undefined when the evaluator id does not belong to the language', () => {
    expect(splitEvaluatorId('python2', 'python3Pvml')).toBeUndefined();
  });
});

describe('joinEvaluatorId', () => {
  test('prefixes the evaluator suffix with the language id', () => {
    expect(joinEvaluatorId('python2', 'Pvml')).toBe('python2Pvml');
  });
});
