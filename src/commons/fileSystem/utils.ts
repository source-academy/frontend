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
