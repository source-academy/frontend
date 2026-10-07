import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { describe, expect, test } from 'vitest';

import { resolveEv3EvaluatorPath } from './resolveEv3Evaluator';

function language(evaluators: ILanguageDefinition['evaluators']): ILanguageDefinition {
  return { id: 'python3', name: 'Python §3', evaluators } as ILanguageDefinition;
}

describe(resolveEv3EvaluatorPath, () => {
  test("returns the path of the language's ev3 evaluator", () => {
    const python3 = language([
      {
        id: 'python3Py2js',
        name: 'Python §3',
        path: 'https://example.org/Py2Js.js',
        capabilities: [],
      },
      {
        id: 'python3Ev3',
        name: 'Python §3',
        path: 'https://example.org/ev3-remote-runner.js',
        capabilities: ['ev3'],
      },
    ] as ILanguageDefinition['evaluators']);

    expect(resolveEv3EvaluatorPath(python3)).toBe('https://example.org/ev3-remote-runner.js');
  });

  test('throws, rather than falling back to a bundled runner, when the language has no ev3 evaluator', () => {
    const python3 = language([
      {
        id: 'python3Py2js',
        name: 'Python §3',
        path: 'https://example.org/Py2Js.js',
        capabilities: [],
      },
    ] as ILanguageDefinition['evaluators']);

    expect(() => resolveEv3EvaluatorPath(python3)).toThrow(/no EV3 evaluator for Python §3/);
  });

  test('throws when no language is selected', () => {
    expect(() => resolveEv3EvaluatorPath(undefined)).toThrow(/no language is selected/);
  });
});
