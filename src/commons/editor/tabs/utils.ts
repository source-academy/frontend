import { posix as pathlib } from 'path';

/**
 * Returns the shortest file paths that is uniquely identifiable among
 * all open editor tabs. This is similar to how most code editors available
 * handle the displaying of file names.
 *
 * For example, if there are 3 open editor tabs where the file names are
 * exactly the same, we would need to display more of the file path to be
 * able to distinguish which editor tab corresponds to which file. Given
 * the following absolute file paths:
 * - /a.js
 * - /dir1/a.js
 * - /dir1/dir2/a.js
 * The shortest unique file paths will be:
 * - /a.js
 * - /dir1/a.js
 * - /dir2/a.js
 *
 * @param originalFilePaths The file paths to be shortened.
 */
export const getShortestUniqueFilePaths = (originalFilePaths: string[]): string[] => {
  // Store the unique shortened file paths as a mapping from the original file paths
  // to the shortened file paths. This is necessary because the output of this function
  // must preserve the original ordering of file paths.
  const originalToUniqueShortenedFilePaths: Record<string, string> = {};
  // Split each original file path into path segments and store the mapping from file
  // path to path segments for O(1) lookup. Since we only deal with the BrowserFS file
  // system, the path separator will always be '/'.
  const filePathSegments: Record<string, string[]> = originalFilePaths.reduce<
    typeof filePathSegments
  >(
    (segments, filePath) => ({
      ...segments,
      // It is necessary to remove empty segments to deal with the very first '/' in
      // file paths.
      [filePath]: filePath.split(pathlib.sep).filter(segment => segment !== '')
    }),
    {}
  );

  for (
    let numOfPathSegments = 1;
    // Keep looping while some original file paths have yet to be shortened.
    Object.keys(originalToUniqueShortenedFilePaths).length < originalFilePaths.length;
    numOfPathSegments++
  ) {
    // Based on the number of path segments for the iteration, we construct the
    // shortened file path. We then store the mapping from the shortened file path
    // to any original file path which transforms into it.
    const shortenedToOriginalFilePaths: Record<string, string[]> = Object.entries(
      filePathSegments
    ).reduce<typeof shortenedToOriginalFilePaths>(
      (filePaths, [originalFilePath, filePathSegments]) => {
        // Note that if there are fewer path segments than the number being sliced,
        // all of the path segments will be returned without error.
        const shortenedFilePath = '/' + filePathSegments.slice(-numOfPathSegments).join('/');
        return {
          ...filePaths,
          [shortenedFilePath]: (filePaths[shortenedFilePath] ?? []).concat(originalFilePath)
        };
      },
      {}
    );
    // Each shortened file path that only has a single corresponding original file
    // path is added to the unique shortened file paths record and their entry in
    // the file path segments record is removed to prevent further processing.
    Object.entries(shortenedToOriginalFilePaths).forEach(
      ([shortenedFilePath, originalFilePaths]) => {
        if (originalFilePaths.length > 1) {
          return;
        }

        const originalFilePath = originalFilePaths[0];
        originalToUniqueShortenedFilePaths[originalFilePath] = shortenedFilePath;
        // Remove the file path's segments from the next iteration.
        delete filePathSegments[originalFilePath];
      }
    );
  }

  // Finally, we retrieve the unique shortened file paths while preserving the ordering
  // of file paths.
  return originalFilePaths.map(filePath => originalToUniqueShortenedFilePaths[filePath]);
};
