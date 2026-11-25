import { describe, expect, test } from 'vitest';

import { errorFromException, ErrorSeverity, ErrorType, formatErrors } from './InterpreterError';

const at = (line: number, message: string) => ({
  type: ErrorType.RUNTIME,
  severity: ErrorSeverity.ERROR,
  location: { start: { line, column: 0 }, end: { line, column: 0 } },
  explain: () => message,
  elaborate: () => '',
});

describe('formatErrors', () => {
  test('puts the line before the explanation, one error to a line', () => {
    expect(formatErrors([at(3, 'x is not defined'), at(7, 'division by zero')])).toBe(
      'Line 3: x is not defined\nLine 7: division by zero',
    );
  });

  test('leaves out the line when there is no location', () => {
    expect(formatErrors([at(0, 'no location'), at(-1, 'unknown')])).toBe('no location\nunknown');
  });

  test('names the file when the location has one', () => {
    const error = at(2, 'bad');
    error.location = { ...error.location, source: '/a.py' } as typeof error.location;
    expect(formatErrors([error])).toBe('[/a.py] Line 2: bad');
  });
});

describe('errorFromException', () => {
  test('is a runtime error that says what the exception said', () => {
    const error = errorFromException(new Error('boom'));
    expect(error.type).toBe(ErrorType.RUNTIME);
    expect(error.explain()).toBe('Error: boom');
    expect(formatErrors([error])).toBe('Error: boom');
  });
});
