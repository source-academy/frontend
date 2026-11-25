/**
 * What the frontend shows of an error that an evaluator reports. The frontend builds these itself
 * from what crosses the Conductor boundary (see `toConductorSourceError` in `evalCode.ts`), so it
 * does not depend on any language runtime's error classes.
 */

export enum ErrorType {
  IMPORT = 'Import',
  RUNTIME = 'Runtime',
  SYNTAX = 'Syntax',
  TYPE = 'Type',
}

export enum ErrorSeverity {
  WARNING = 'Warning',
  ERROR = 'Error',
}

/** Lines are 1-based and columns 0-based; a line below 1 means that there is no location. */
export type SourcePosition = { line: number; column: number };

export type SourceLocation = {
  source?: string | null;
  start: SourcePosition;
  end: SourcePosition;
};

export type InterpreterError = {
  readonly type: ErrorType;
  readonly severity: ErrorSeverity;
  location: SourceLocation;
  explain(): string;
  elaborate(): string;
};

export const UNKNOWN_LOCATION: SourceLocation = {
  start: { line: -1, column: -1 },
  end: { line: -1, column: -1 },
};

/** A runtime error that says what an exception said, at the location if there is one. */
export function errorFromException(
  error: Error,
  location: SourceLocation = UNKNOWN_LOCATION,
): InterpreterError {
  return {
    type: ErrorType.RUNTIME,
    severity: ErrorSeverity.ERROR,
    location,
    explain: () => error.toString(),
    elaborate: () => '',
  };
}

/** The text that the REPL and the test cases show for errors: one line each, with its line number. */
export function formatErrors(errors: InterpreterError[]): string {
  return errors
    .map(error => {
      const filePath = error.location?.source ? `[${error.location.source}] ` : '';
      const line = error.location?.start?.line ?? -1;
      const explanation = error.explain();
      return line < 1 ? explanation : `${filePath}Line ${line}: ${explanation}`;
    })
    .join('\n');
}
