import { FSModule } from 'browserfs/dist/node/core/FS';
import path from 'path';

import { WORKSPACE_BASE_PATHS } from '../../pages/fileSystem/createInBrowserFileSystem';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';

type File = {
  path: string;
  contents: string;
};

/**
 * Retrieves the files in the specified workspace as a record that maps from
 * file path to file content. Because BrowserFS lacks an equivalent to Node.js's
 * Promises API, we need to wrap each asynchronous call to the file system with
 * promises ourselves.
 *
 * @param workspaceLocation The location of the workspace.
 * @param fileSystem        The file system instance.
 */
export const retrieveFilesInWorkspaceAsRecord = (
  workspaceLocation: WorkspaceLocation,
  fileSystem: FSModule
): Promise<Record<string, string>> => {
  const processFile = (filePath: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      fileSystem.readFile(filePath, 'utf-8', (err, fileContents) => {
        if (err) {
          console.error(err);
        }
        if (fileContents === undefined) {
          reject();
          return;
        }

        resolve({
          path: filePath,
          contents: fileContents
        });
      });
    });
  };

  const processDirectory = (directoryPath: string): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      fileSystem.readdir(directoryPath, (err, fileNames) => {
        if (err) {
          console.error(err);
        }
        if (fileNames === undefined) {
          reject();
          return;
        }

        const promises: Array<Promise<File | File[]>> = [];
        for (const fileName of fileNames) {
          const fullPath = path.join(directoryPath, fileName);
          promises.push(
            new Promise((resolve, reject) => {
              fileSystem.lstat(fullPath, (err, stats) => {
                if (err) {
                  console.error(err);
                }
                if (stats === undefined) {
                  reject();
                  return;
                }

                if (stats.isFile()) {
                  resolve(processFile(fullPath));
                } else if (stats.isDirectory()) {
                  resolve(processDirectory(fullPath));
                }
              });
            })
          );
        }

        Promise.all(promises).then((values: Array<File | File[]>) => {
          resolve(values.flat());
        });
      });
    });
  };

  const files = processDirectory(WORKSPACE_BASE_PATHS[workspaceLocation]);
  // Convert from array to record.
  return files.then((files: File[]) => {
    return files.reduce((record: Record<string, string>, file: File) => {
      record[file.path] = file.contents;
      return record;
    }, {});
  });
};

/**
 * Removes a directory recursively.
 *
 * BrowserFS's `rmdir` function is unable to remove non-empty directories despite being modelled
 * after Node.js's file system API. In Node.js, the `rmdir` function takes in an `options` object
 * where recursive directory removal can be set (https://nodejs.org/api/fs.html#fspromisesrmdirpath-options).
 * The BrowserFS equivalent however does not support these options and will fail with ENOTEMPTY
 * when trying to remove a non-empty directory.
 *
 * @param fileSystem    The file system instance.
 * @param directoryPath The path of the directory to be removed.
 */
export const rmdirRecursively = (fileSystem: FSModule, directoryPath: string): Promise<boolean> => {
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
