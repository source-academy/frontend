import { getShortestUniqueFilePaths } from '../../tabs/utils';

describe('getShortestUniqueFilePaths', () => {
  it('returns the shortest unique file paths', () => {
    const filePaths = ['/dir/dir1/a.js', '/dir/dir2/a.js', '/dir/dir1/b.js'];
    const shortenedFilePaths = getShortestUniqueFilePaths(filePaths);
    expect(shortenedFilePaths).toEqual(['/dir1/a.js', '/dir2/a.js', '/b.js']);
  });

  it('works even when the number of path segments in a file path is less than the number of iterations', () => {
    const filePaths = ['/a.js', '/dir/dir2/a.js'];
    const shortenedFilePaths = getShortestUniqueFilePaths(filePaths);
    expect(shortenedFilePaths).toEqual(['/a.js', '/dir2/a.js']);
  });
});
