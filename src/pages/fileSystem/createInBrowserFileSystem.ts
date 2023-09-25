import { BFSRequire, configure } from 'browserfs';
import { ApiError } from 'browserfs/dist/node/core/api_error';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { Store } from 'redux';
import { OverallState } from 'src/commons/redux/AllTypes';
import {
  WORKSPACE_BASE_PATHS,
} from 'src/commons/redux/workspace/WorkspaceReduxTypes';
import { EditorTabState } from 'src/commons/redux/workspace/WorkspaceStateTypes';

import { setInBrowserFileSystem } from '../../commons/fileSystem/FileSystemActions';
import { writeFileRecursively } from '../../commons/fileSystem/utils';

export const createInBrowserFileSystem = (store: Store<OverallState>): Promise<void> => {
  return new Promise((resolve, reject) => {
    configure(
      {
        fs: 'MountableFileSystem',
        options: {
          [WORKSPACE_BASE_PATHS.playground]: {
            fs: 'IndexedDB',
            options: {
              storeName: 'playground'
            }
          },
          [WORKSPACE_BASE_PATHS.sicp]: {
            fs: 'IndexedDB',
            options: {
              storeName: 'sicp'
            }
          }
        }
      },
      (err: ApiError | null | undefined) => {
        if (err) {
          reject(err);
          return;
        }
        // Set the browser file system reference in the Redux store for retrieval
        // in other parts of the codebase.
        const fileSystem = BFSRequire('fs');
        store.dispatch(setInBrowserFileSystem(fileSystem));
        // Create files for editor tabs if they do not exist. This can happen when
        // editor tabs are initialised from the Redux store defaults, as opposed to
        // being created by the user.
        const { stories, ...workspaceStates } = store.getState().workspaces;
        const promises: Promise<void>[] = [];
        for (const workspaceState of Object.values(workspaceStates)) {
          const editorTabs = workspaceState.editorState.editorTabs;
          promises.push(createFilesForEditorTabs(fileSystem, editorTabs));
        }

        for (const storyEnvState of Object.values(stories.envs)) {
          const editorTabs = storyEnvState.editorState.editorTabs;
          promises.push(createFilesForEditorTabs(fileSystem, editorTabs));
        }

        Promise.all(promises)
          .then(() => resolve())
          .catch(err => reject(err));
      }
    );
  });
};

// An EditorTabWithFile is an editor tab with an associated file path.
type EditorTabWithFile = EditorTabState & {
  filePath: string;
};

const createFilesForEditorTabs = async (fileSystem: FSModule, editorTabs: EditorTabState[]) => {
  const editorTabsWithFile = editorTabs.filter(
    (editorTab): editorTab is EditorTabWithFile => editorTab.filePath !== undefined
  );
  const promises = editorTabsWithFile.map((editorTab): Promise<void> => {
    return new Promise((resolve, reject) => {
      fileSystem.exists(editorTab.filePath, filePathExists => {
        if (filePathExists) {
          resolve();
          return;
        }

        writeFileRecursively(fileSystem, editorTab.filePath, editorTab.value)
          .then(() => resolve())
          .catch(err => reject(err));
      });
    });
  });
  await Promise.all(promises);
};
