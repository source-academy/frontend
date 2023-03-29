import { BFSRequire, configure } from 'browserfs';
import { ApiError } from 'browserfs/dist/node/core/api_error';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { Store } from 'redux';

import { OverallState } from '../../commons/application/ApplicationTypes';
import { setInBrowserFileSystem } from '../../commons/fileSystem/FileSystemActions';
import { EditorTabState, WorkspaceManagerState } from '../../commons/workspace/WorkspaceTypes';

/**
 * Maps workspaces to their file system base path.
 * An empty path indicates that the workspace is not
 * linked to the file system.
 */
export const WORKSPACE_BASE_PATHS: Record<keyof WorkspaceManagerState, string> = {
  assessment: '',
  githubAssessment: '',
  grading: '',
  playground: '/playground',
  sicp: '',
  sourcecast: '',
  sourcereel: ''
};

export const createInBrowserFileSystem = (store: Store<OverallState>) => {
  configure(
    {
      fs: 'MountableFileSystem',
      options: {
        [WORKSPACE_BASE_PATHS.playground]: {
          fs: 'IndexedDB',
          options: {
            storeName: 'playground'
          }
        }
      }
    },
    (err: ApiError | null | undefined) => {
      if (err) {
        console.error(err);
      }
      // Set the browser file system reference in the Redux store for retrieval
      // in other parts of the codebase.
      const fileSystem = BFSRequire('fs');
      store.dispatch(setInBrowserFileSystem(fileSystem));
      // Create files for editor tabs if they do not exist. This can happen when
      // editor tabs are initialised from the Redux store defaults, as opposed to
      // being created by the user.
      const workspaceStates = store.getState().workspaces;
      Object.entries(workspaceStates).forEach(([_workspaceLocation, workspaceState]) => {
        const editorTabs = workspaceState.editorTabs;
        createFilesForEditorTabs(fileSystem, editorTabs);
      });
    }
  );
};

// An EditorTabWithFile is an editor tab with an associated file path.
type EditorTabWithFile = EditorTabState & {
  filePath: string;
};

const createFilesForEditorTabs = (fileSystem: FSModule, editorTabs: EditorTabState[]) => {
  const editorTabsWithFile = editorTabs.filter(
    (editorTab): editorTab is EditorTabWithFile => editorTab.filePath !== undefined
  );
  editorTabsWithFile.forEach(editorTab => {
    fileSystem.exists(editorTab.filePath, filePathExists => {
      if (filePathExists) {
        return;
      }

      fileSystem.writeFile(editorTab.filePath, editorTab.value, err => {
        if (err) {
          console.error(err);
        }
      });
    });
  });
};
