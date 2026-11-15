import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { describe, expect, test } from 'vitest';

import {
  getFamilyLanguages,
  getLanguageFamily,
  getSelectableEvaluators,
  getVariantLabel,
  groupLanguagesByFamily,
  pickVariantForFamily,
} from './languageFamily';

function makeLanguage(
  id: string,
  name: string,
  family?: string,
  evaluators: ILanguageDefinition['evaluators'] = [],
): ILanguageDefinition {
  return { id, name, evaluators, ...(family ? { family } : {}) };
}

const languages: ILanguageDefinition[] = [
  makeLanguage('python1', 'Python §1', 'Python'),
  makeLanguage('python2', 'Python §2', 'Python'),
  makeLanguage('pythonFull', 'Python', 'Python'),
  makeLanguage('source1', 'JavaScript §1', 'JavaScript'),
  makeLanguage('scheme', 'Scheme', 'Scheme'),
];

describe('getLanguageFamily', () => {
  test('uses the family field when present', () => {
    expect(getLanguageFamily(makeLanguage('source1', 'JavaScript §1', 'Source'))).toBe('Source');
  });

  test('falls back to the first word of the name', () => {
    expect(getLanguageFamily(makeLanguage('python3', 'Python §3'))).toBe('Python');
    expect(getLanguageFamily(makeLanguage('scheme', 'Scheme'))).toBe('Scheme');
  });
});

describe('groupLanguagesByFamily', () => {
  test('groups in order of first appearance', () => {
    expect(
      groupLanguagesByFamily(languages).map(f => [f.name, f.languages.map(l => l.id)]),
    ).toEqual([
      ['Python', ['python1', 'python2', 'pythonFull']],
      ['JavaScript', ['source1']],
      ['Scheme', ['scheme']],
    ]);
  });
});

describe('getVariantLabel', () => {
  test('marks a variant named after its family as full', () => {
    const python = getFamilyLanguages(languages, languages[0]);
    expect(getVariantLabel(languages[0], python)).toBe('Python §1');
    expect(getVariantLabel(languages[2], python)).toBe('Python (Full)');
  });

  test('leaves the only variant of a family alone', () => {
    expect(getVariantLabel(languages[4], [languages[4]])).toBe('Scheme');
  });
});

describe('pickVariantForFamily', () => {
  test('prefers the given language when it is in the family', () => {
    expect(pickVariantForFamily(languages, 'Python', 'python2')?.id).toBe('python2');
  });

  test('otherwise picks the first variant', () => {
    expect(pickVariantForFamily(languages, 'Python', 'source1')?.id).toBe('python1');
    expect(pickVariantForFamily(languages, 'Python')?.id).toBe('python1');
  });

  test('returns undefined for an unknown family', () => {
    expect(pickVariantForFamily(languages, 'C')).toBeUndefined();
  });
});

describe('getSelectableEvaluators', () => {
  test('excludes tool evaluators', () => {
    const language = makeLanguage('python1', 'Python §1', 'Python', [
      { id: 'python1Py2js', name: 'py2js', path: '', capabilities: [] },
      { id: 'python1Stepper', name: 'Python §1', path: '', capabilities: ['stepper'] },
    ] as ILanguageDefinition['evaluators']);
    expect(getSelectableEvaluators(language).map(e => e.id)).toEqual(['python1Py2js']);
  });
});
