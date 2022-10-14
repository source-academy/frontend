import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';

// BrowserFS's `rmdir` function is unable to remove non-empty directories despite being modelled after Node.js's
// file system API. In Node.js, the `rmdir` function takes in an `options` object where recursive directory removal
// can be set (https://nodejs.org/api/fs.html#fspromisesrmdirpath-options). The BrowserFS equivalent however does
// not support these options and will fail with ENOTEMPTY when trying to remove a non-empty directory.
export const rmdirRecursively = (fileSystem: FSModule, directoryPath: string) => {
  return new Promise((resolve, reject) => {
    fileSystem.readdir(directoryPath, async (err, fileNames) => {
      if (err) {
        reject(err);
      }
      if (fileNames === undefined) {
        return;
      }

      const removeFile = (fileName: string) => {
        const fullPath = path.join(directoryPath, fileName);
        return new Promise((resolve, reject) => {
          fileSystem.lstat(fullPath, async (err, stats) => {
            if (err) {
              return reject(err);
            }
            if (stats === undefined) {
              return;
            }

            if (stats.isFile()) {
              await new Promise((resolve, reject) => {
                fileSystem.unlink(fullPath, err => {
                  if (err) {
                    reject(err);
                  }
                  resolve(true);
                });
              });
            } else if (stats.isDirectory()) {
              await rmdirRecursively(fileSystem, fullPath);
            }

            resolve(stats);
          });
        });
      };

      // Remove each file/directory in parallel.
      Promise.all(fileNames.map(removeFile)).then(() => {
        fileSystem.rmdir(directoryPath, err => {
          if (err) {
            console.error(err);
          }

          resolve(true);
        });
      });
    });
  });
};
