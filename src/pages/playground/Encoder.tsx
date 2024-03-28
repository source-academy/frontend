import { OverallState } from 'src/commons/application/ApplicationTypes'; 
import { useSelector } from 'react-redux';
import { Chapter, Variant } from 'js-slang/dist/types';
import { retrieveFilesInWorkspaceAsRecord } from 'src/commons/fileSystem/utils';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { EditorTabState } from 'src/commons/workspace/WorkspaceTypes';
import * as qs from 'query-string';
import { compressToEncodedURIComponent } from 'lz-string';
import { useState } from 'react';

export const EncodeURL = () => {
    const isFolderModeEnabled: boolean = useSelector(
      (state: OverallState) => state.workspaces.playground.isFolderModeEnabled
    );
    
    const editorTabs: EditorTabState[] = useSelector(
      (state: OverallState) => state.workspaces.playground.editorTabs
    );
    const editorTabFilePaths = editorTabs
      .map((editorTab: EditorTabState) => editorTab.filePath)
      .filter((filePath): filePath is string => filePath !== undefined);
    const activeEditorTabIndex: number | null = useSelector(
      (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
    );
    const chapter: Chapter = useSelector(
      (state: OverallState) => state.workspaces.playground.context.chapter
    );
    const variant: Variant = useSelector(
      (state: OverallState) => state.workspaces.playground.context.variant
    );
    const execTime: number = useSelector(
      (state: OverallState) => state.workspaces.playground.execTime
    );
    const fileSystem: FSModule | null = GetFileSystem();
    
    const result: object = {
      isFolder: isFolderModeEnabled,
      files: fileSystem == null ? null : GetFile(fileSystem),
      tabs: editorTabFilePaths.map(compressToEncodedURIComponent)[0],
      tabIdx: activeEditorTabIndex,
      chap: chapter,
      variant,
      ext: "NONE",
      exec: execTime
    };
    
    return result;
  }
    
  const GetFileSystem = () => {
    const fileSystem: FSModule | null = useSelector(
      (state: OverallState) => state.fileSystem.inBrowserFileSystem
    );
    return fileSystem;
  }
  
  const GetFile = (fileSystem: FSModule) => {
    const [files, setFiles] = useState<Record<string,string>>();
    retrieveFilesInWorkspaceAsRecord('playground', fileSystem)
    .then((result: Record<string, string>) => {
      setFiles(result)
    })
    return files == null ? null : compressToEncodedURIComponent(qs.stringify(files))
    // compressToEncodedURIComponent(qs.stringify(retrieveFilesInWorkspaceAsRecord('playground', fileSystem)))
  }