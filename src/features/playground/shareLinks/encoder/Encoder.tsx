import { FSModule } from 'browserfs/dist/node/core/FS';
import { compressToEncodedURIComponent } from 'lz-string';
import qs from 'query-string';
import { useState } from 'react';
import { retrieveFilesInWorkspaceAsRecord } from 'src/commons/fileSystem/utils';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { EditorTabState } from 'src/commons/workspace/WorkspaceTypes';

import ShareLinkState from '../ShareLinkState';

export const usePlaygroundConfigurationEncoder = () => {
  const isFolderModeEnabled = useTypedSelector(
    state => state.workspaces.playground.isFolderModeEnabled
  );

  const editorTabs = useTypedSelector(state => state.workspaces.playground.editorTabs);
  const editorTabFilePaths = editorTabs
    .map((editorTab: EditorTabState) => editorTab.filePath)
    .filter((filePath): filePath is string => filePath !== undefined);
  const activeEditorTabIndex: number | null = useTypedSelector(
    state => state.workspaces.playground.activeEditorTabIndex
  );
  const chapter = useTypedSelector(state => state.workspaces.playground.context.chapter);
  const variant = useTypedSelector(state => state.workspaces.playground.context.variant);
  const execTime = useTypedSelector(state => state.workspaces.playground.execTime);
  const files = useGetFile();

  const result: ShareLinkState = {
    isFolder: isFolderModeEnabled.toString(),
    files: files.toString(),
    tabs: editorTabFilePaths.map(compressToEncodedURIComponent)[0],
    tabIdx: activeEditorTabIndex?.toString(),
    chap: chapter.toString(),
    variant,
    ext: 'NONE',
    exec: execTime.toString()
  };

  return result;
};

const useGetFile = () => {
  const fileSystem = useTypedSelector(state => state.fileSystem.inBrowserFileSystem);
  const [files, setFiles] = useState<Record<string, string>>({});
  retrieveFilesInWorkspaceAsRecord('playground', fileSystem as FSModule).then(result => {
    setFiles(result);
  });
  return compressToEncodedURIComponent(qs.stringify(files));
};
