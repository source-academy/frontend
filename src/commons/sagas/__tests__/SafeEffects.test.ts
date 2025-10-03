import * as Sentry from '@sentry/react';
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { describe, expect, it, vi } from 'vitest';

import { wrapSaga } from '../SafeEffects';

vi.mock(import('@sentry/react'), async importOriginal => ({
  ...(await importOriginal()),
  captureException: vi.fn()
}));

// Silence console error
vi.spyOn(console, 'error').mockImplementation(x => {});

describe(wrapSaga, () => {
  it('is transparent', async () => {
    const mockFn = vi.fn();
    const wrappedSaga = wrapSaga(function* () {
      yield call(mockFn);
    });

    await expectSaga(wrappedSaga).silentRun();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('handles errors appropriately', async () => {
    const errorToThrow = new Error();
    // eslint-disable-next-line require-yield
    const wrappedSaga = wrapSaga(function* () {
      throw errorToThrow;
    });

    await expectSaga(wrappedSaga).silentRun();

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(errorToThrow);
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
