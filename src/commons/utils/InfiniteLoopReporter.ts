import * as Sentry from '@sentry/browser';
import { getInfiniteLoopData, InfiniteLoopErrorType } from 'js-slang/dist/infiniteLoops/errors';

/**
 * Sends the infinite loop data to Sentry. Uses a unique Sentry
 * fingerprint so all 'errors' reported here are grouped under a
 * single issue in Sentry.
 *
 * @param {string} errors - infinite loop error classification
 * @param {string} code - code to be sent along with the error
 */
function reportInfiniteLoopError(
  errorType: InfiniteLoopErrorType,
  isStream: boolean,
  message: string,
  code: string[]
) {
  Sentry.withScope(function (scope) {
    scope.clearBreadcrumbs();
    scope.setLevel(Sentry.Severity.Info);
    scope.setTag('error-type', InfiniteLoopErrorType[errorType]);
    scope.setTag('is-stream', isStream ? 'yes' : 'no');
    scope.setTag('message', message);
    scope.setExtra('code', JSON.stringify(code));
    scope.setFingerprint(['INFINITE_LOOP_LOGGING_FINGERPRINT_2022']);
    const err = new Error('Infinite Loop');
    // remove stack trace whenever we can to save space
    err.stack = '';
    Sentry.captureException(err);
  });
}

export { getInfiniteLoopData, reportInfiniteLoopError, InfiniteLoopErrorType };
