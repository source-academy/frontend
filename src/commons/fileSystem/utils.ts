import { FSModule } from 'browserfs/dist/node/core/FS';
import Stats from 'browserfs/dist/node/core/node_fs_stats';
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
          reject(err);
          return;
        }
        if (fileContents === undefined) {
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
          reject(err);
          return;
        }
        if (fileNames === undefined) {
          return;
        }

        const promises: Array<Promise<File | File[]>> = [];
        for (const fileName of fileNames) {
          const fullPath = path.join(directoryPath, fileName);
          promises.push(
            new Promise((resolve, reject) => {
              fileSystem.lstat(fullPath, (err, stats) => {
                if (err) {
                  reject(err);
                  return;
                }
                if (stats === undefined) {
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
 * Overwrites the files in the workspace with the ones specified. Because BrowserFS
 * lacks an equivalent to Node.js's Promises API, we need to wrap each asynchronous
 * call to the file system with promises ourselves.
 *
 * @param workspaceLocation The location of the workspace.
 * @param fileSystem        The file system instance.
 * @param files             A mapping from file paths to file contents.
 */
export const overwriteFilesInWorkspace = async (
  workspaceLocation: WorkspaceLocation,
  fileSystem: FSModule,
  files: Record<string, string>
): Promise<void> => {
  await rmFilesInDirRecursively(fileSystem, WORKSPACE_BASE_PATHS[workspaceLocation]);
  for (const [filePath, fileContents] of Object.entries(files)) {
    await writeFileRecursively(fileSystem, filePath, fileContents);
  }
};

/**
 * Removes the files & directories in a directory recursively, but leave
 * the directory itself intact.
 *
 * @param fileSystem    The file system instance.
 * @param directoryPath The path of the directory to be removed.
 */
export const rmFilesInDirRecursively = (
  fileSystem: FSModule,
  directoryPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fileSystem.readdir(directoryPath, async (err, fileNames): Promise<void> => {
      if (err) {
        reject(err);
        return;
      }
      if (fileNames === undefined) {
        return;
      }

      const removeFile = (fileName: string): Promise<Stats> => {
        const fullPath = path.join(directoryPath, fileName);
        return new Promise((resolve, reject) => {
          fileSystem.lstat(fullPath, async (err, stats) => {
            if (err) {
              reject(err);
              return;
            }
            if (stats === undefined) {
              return;
            }

            if (stats.isFile()) {
              await new Promise((resolve, reject) => {
                fileSystem.unlink(fullPath, err => {
                  if (err) {
                    reject(err);
                    return;
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
      Promise.all(fileNames.map(removeFile))
        .then(() => resolve())
        .catch(err => reject(err));
    });
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
export const rmdirRecursively = (fileSystem: FSModule, directoryPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    rmFilesInDirRecursively(fileSystem, directoryPath)
      .then(() => {
        fileSystem.rmdir(directoryPath, err => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      })
      .catch(err => reject(err));
  });
};

/**
 * Writes a file recursively by creating all parent directories if they do not exist.
 *
 * BrowserFS's `mkdir` function is unable to recursively create directories despite being modelled
 * after Node.js's file system API. In Node.js, the `mkdir` function takes in an `options` object
 * where recursive directory creation can be set (https://nodejs.org/api/fs.html#fspromisesmkdirpath-options).
 * The BrowserFS equivalent however does not support these options and will fail with ENOENT
 * when trying to create directories recursively.
 *
 * @param fileSystem   The file system instance.
 * @param filePath     The path of the file to be written to.
 * @param fileContents The contents of the file to be written to.
 */
export const writeFileRecursively = (
  fileSystem: FSModule,
  filePath: string,
  fileContents: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create directories along the path if they do not exist.
    // Remove empty path segments.
    const pathSegments = filePath.split(path.sep).filter(path => path !== '');
    // The last path segment is not a directory but the name of the file, so we ignore it.
    for (let i = 1; i < pathSegments.length; i++) {
      const dirPath = '/' + path.join(...pathSegments.slice(0, i));
      const promise: Promise<void> = new Promise((resolve, reject) => {
        // Check whether the directory path already exists to prevent overwriting of existing files & directories.
        fileSystem.exists(dirPath, dirPathExists => {
          if (dirPathExists) {
            resolve();
            return;
          }

          fileSystem.mkdir(dirPath, 777, err => {
            if (err) {
              reject(err);
              return;
            }

            resolve();
          });
        });
      });
      promise.catch(err => reject(err));
    }

    // Write to the file.
    fileSystem.writeFile(filePath, fileContents, err => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};
