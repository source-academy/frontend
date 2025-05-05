import * as Sentry from '@sentry/browser';
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import { wrapSaga } from '../SafeEffects';

jest.spyOn(Sentry, 'captureException');

// Silence console error
jest.spyOn(console, 'error').mockImplementation(x => {});

describe('Test wrapSaga', () => {
  test('wrapSaga is transparent', async () => {
    const mockFn = jest.fn();
    const wrappedSaga = wrapSaga(function* () {
      yield call(mockFn);
    });

    await expectSaga(wrappedSaga).silentRun();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('wrapSaga handles errors appropriately', async () => {
    const errorToThrow = new Error();
    const wrappedSaga = wrapSaga(function* () {
      throw errorToThrow;
    });

    await expectSaga(wrappedSaga).silentRun();

    expect(Sentry.captureException).toHaveBeenCalledWith(errorToThrow);
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
