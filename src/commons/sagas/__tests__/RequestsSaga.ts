import * as RequestsSaga from '../../utils/RequestHelper';
import { getSharedProgram, postSharedProgram } from '../RequestsSaga';
import { mockTokens, RequestMock } from './RequestMock';

describe('RequestsSaga tests', () => {
  const request = jest.spyOn(RequestsSaga, 'request');
  const mockJsonFn = jest.fn();
  const mockTextFn = jest.fn();

  beforeEach(() => {
    mockJsonFn.mockReset();
    mockTextFn.mockReset();
  });

  describe('GET /shared_programs/:uuid', () => {
    test('Success', async () => {
      request.mockImplementationOnce(RequestMock.success(mockJsonFn));
      await getSharedProgram('uuid', mockTokens);

      expect(mockJsonFn).toHaveBeenCalledTimes(1);
    });

    test('No response', async () => {
      request.mockImplementationOnce(RequestMock.noResponse());

      await expect(getSharedProgram('uuid', mockTokens)).rejects.toThrow(
        'Failed to fetch program from shared link!'
      );
    });

    test('Non ok', async () => {
      request.mockImplementationOnce(RequestMock.nonOk());

      await expect(getSharedProgram('uuid', mockTokens)).rejects.toThrow('Invalid shared link!');
    });
  });

  describe('POST /shared_programs', () => {
    test('Success', async () => {
      request.mockImplementationOnce(RequestMock.success(mockJsonFn));
      await postSharedProgram('programConfiguration', mockTokens);

      expect(mockJsonFn).toHaveBeenCalledTimes(1);
    });

    test('No response', async () => {
      request.mockImplementationOnce(RequestMock.noResponse());

      await expect(postSharedProgram('programConfiguration', mockTokens)).rejects.toThrow(
        'Failed to generate shortened URL!'
      );
    });

    test('Non ok', async () => {
      const customMessage = 'custom-message';
      mockTextFn.mockReturnValue(customMessage);
      request.mockImplementationOnce(RequestMock.nonOk(mockTextFn));

      await expect(postSharedProgram('programConfiguration', mockTokens)).rejects.toThrow(
        `Failed to generate shortened URL: ${customMessage}`
      );
    });
  });
});
