import { FSModule } from 'browserfs/dist/node/core/FS';
import { Chapter, Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import qs from 'query-string';
import { useState } from 'react';
// import { OverallState } from 'src/commons/application/ApplicationTypes';
import { retrieveFilesInWorkspaceAsRecord } from 'src/commons/fileSystem/utils';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { EditorTabState } from 'src/commons/workspace/WorkspaceTypes';

export const EncodeURL = () => {
  const isFolderModeEnabled: boolean = useTypedSelector(
    state => state.workspaces.playground.isFolderModeEnabled
  );

  const editorTabs: EditorTabState[] = useTypedSelector(
    state => state.workspaces.playground.editorTabs
  );
  const editorTabFilePaths = editorTabs
    .map((editorTab: EditorTabState) => editorTab.filePath)
    .filter((filePath): filePath is string => filePath !== undefined);
  const activeEditorTabIndex: number | null = useTypedSelector(
    state => state.workspaces.playground.activeEditorTabIndex
  );
  const chapter: Chapter = useTypedSelector(state => state.workspaces.playground.context.chapter);
  const variant: Variant = useTypedSelector(state => state.workspaces.playground.context.variant);
  const execTime: number = useTypedSelector(state => state.workspaces.playground.execTime);
  const fileSystem: FSModule = GetFileSystem();

  const result: object = {
    isFolder: isFolderModeEnabled,
    files: GetFile(fileSystem),
    tabs: editorTabFilePaths.map(compressToEncodedURIComponent)[0],
    tabIdx: activeEditorTabIndex,
    chap: chapter,
    variant,
    ext: 'NONE',
    exec: execTime
  };

  return result;
};

const GetFileSystem = () => {
  const fileSystem: FSModule | null = useTypedSelector(
    state => state.fileSystem.inBrowserFileSystem
  );
  return fileSystem as FSModule;
};

const GetFile = (fileSystem: FSModule) => {
  const [files, setFiles] = useState<Record<string, string>>();
  retrieveFilesInWorkspaceAsRecord('playground', fileSystem).then(
    (result: Record<string, string>) => {
      setFiles(result);
    }
  );
  return compressToEncodedURIComponent(qs.stringify(files as Record<string, string>));
};
