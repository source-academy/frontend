export const getShortestUniqueFilePaths = (originalFilePaths: string[]): string[] => {
  const originalToTransformedFilePaths: Record<string, string> = {};
  const filePathSegments: Record<string, string[]> = originalFilePaths.reduce(
    (segments, filePath) => ({
      ...segments,
      [filePath]: filePath.split('/').filter(segment => segment !== '')
    }),
    {}
  );

  for (
    let numOfPathSegments = 1;
    Object.keys(originalToTransformedFilePaths).length < originalFilePaths.length;
    numOfPathSegments++
  ) {
    const transformedToOriginalFilePaths: Record<string, string[]> = Object.entries(
      filePathSegments
    ).reduce((filePaths, [originalFilePath, filePathSegments]) => {
      // Note that if there are fewer path segments than the number being sliced,
      // all of the path segments will be returned without error.
      const transformedFilePath = '/' + filePathSegments.slice(-numOfPathSegments).join('/');
      return {
        ...filePaths,
        [transformedFilePath]: (filePaths[transformedFilePath] ?? []).concat(originalFilePath)
      };
    }, {});
    Object.entries(transformedToOriginalFilePaths).forEach(
      ([transformedFilePath, originalFilePaths]) => {
        if (originalFilePaths.length > 1) {
          return;
        }

        const originalFilePath = originalFilePaths[0];
        originalToTransformedFilePaths[originalFilePath] = transformedFilePath;
        // Remove the file path's segments from the next iteration.
        delete filePathSegments[originalFilePath];
      }
    );
  }

  return originalFilePaths.map(filePath => originalToTransformedFilePaths[filePath]);
};
