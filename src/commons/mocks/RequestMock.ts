import * as RequestsSaga from '../utils/RequestHelper';

export class RequestMock {
  static noResponse(): typeof RequestsSaga.request {
    return () => Promise.resolve(null);
  }

  static nonOk(textMockFn: jest.Mock = jest.fn()): typeof RequestsSaga.request {
    const resp = {
      text: textMockFn,
      ok: false
    } as unknown as Response;

    return () => Promise.resolve(resp);
  }

  static success(
    jsonMockFn: jest.Mock = jest.fn(),
    textMockFn: jest.Mock = jest.fn()
  ): typeof RequestsSaga.request {
    const resp = {
      json: jsonMockFn,
      text: textMockFn,
      ok: true
    } as unknown as Response;

    return () => Promise.resolve(resp);
  }
}

export const mockTokens = { accessToken: 'access', refreshToken: 'refresherOrb' };
