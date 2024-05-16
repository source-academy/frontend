import { RequestMock } from '../../mocks/RequestMock';
import Constants from '../../utils/Constants';
import { externalUrlShortenerRequest } from '../PlaygroundSaga';

describe('Playground saga tests', () => {
  Constants.urlShortenerBase = 'http://url-shortener.com/';

  describe('externalUrlShortenerRequest', () => {
    const mockFetch = jest.spyOn(global, 'fetch');
    const mockJsonFn = jest.fn();

    beforeEach(() => {
      mockJsonFn.mockReset();
    });

    test('200 with success status', async () => {
      const keyword = 'abcde';
      mockJsonFn.mockResolvedValue({
        shorturl: 'shorturl',
        status: 'success',
        url: { keyword }
      });
      mockFetch.mockImplementationOnce(RequestMock.success(mockJsonFn) as unknown as typeof fetch);
      const result = await externalUrlShortenerRequest('queryString', keyword);

      const shortenedUrl = Constants.urlShortenerBase + keyword;
      const message = '';
      expect(result).toStrictEqual({ shortenedUrl, message });
    });

    test('200 with non-success status (due to duplicate URL), returns message', async () => {
      const keyword = 'abcde';
      const message = 'Link already exists in database!';
      mockJsonFn.mockResolvedValue({
        shorturl: 'shorturl',
        status: 'fail',
        url: { keyword },
        message
      });
      mockFetch.mockImplementationOnce(RequestMock.success(mockJsonFn) as unknown as typeof fetch);
      const result = await externalUrlShortenerRequest('queryString', keyword);

      const shortenedUrl = Constants.urlShortenerBase + keyword;
      expect(result).toStrictEqual({ shortenedUrl, message });
    });

    test('200 with non-success status and no shorturl', async () => {
      const message = 'Unable to generate shortlink';
      mockJsonFn.mockResolvedValue({
        status: 'fail',
        message
      });
      mockFetch.mockImplementationOnce(RequestMock.success(mockJsonFn) as unknown as typeof fetch);

      await expect(externalUrlShortenerRequest('queryString', 'keyword')).rejects.toThrow(message);
    });

    test('No response', async () => {
      mockFetch.mockImplementationOnce(RequestMock.noResponse() as unknown as typeof fetch);

      await expect(externalUrlShortenerRequest('queryString', 'keyword')).rejects.toThrow(
        'Something went wrong trying to create the link.'
      );
    });

    test('Non-ok response', async () => {
      mockFetch.mockImplementationOnce(RequestMock.nonOk() as unknown as typeof fetch);

      await expect(externalUrlShortenerRequest('queryString', 'keyword')).rejects.toThrow(
        'Something went wrong trying to create the link.'
      );
    });
  });
});
