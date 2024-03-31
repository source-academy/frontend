import { FSModule } from 'browserfs/dist/node/core/FS';
import { Chapter, Variant } from 'js-slang/dist/types';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { getDefaultFilePath, getLanguageConfig } from 'src/commons/application/ApplicationTypes';
import { overwriteFilesInWorkspace } from 'src/commons/fileSystem/utils';
import {
  showFullJSWarningOnUrlLoad,
  showFulTSWarningOnUrlLoad,
  showHTMLDisclaimer
} from 'src/commons/utils/WarningDialogHelper';
import {
  addEditorTab,
  removeEditorTabsForDirectory,
  setFolderMode,
  updateActiveEditorTabIndex
} from 'src/commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import { playgroundConfigLanguage } from 'src/features/playground/PlaygroundActions';

import { convertParamToBoolean, convertParamToInt } from '../../commons/utils/ParamParseHelper';
import { IParsedQuery, parseQuery } from '../../commons/utils/QueryHelper';
import { WORKSPACE_BASE_PATHS } from '../fileSystem/createInBrowserFileSystem';

export type programConfig = {
  isFolder: string | undefined;
  tabs: string | undefined;
  tabIdx: string | undefined;
  chap: string | undefined;
  variant: string | undefined;
  ext: string | undefined;
  exec: string | undefined;
  files: string | undefined;
  prgrm: string | undefined;
};
/**
 * #chap=4
 * exec=1000
 * ext=NONE
 * files=KQJgYgDgNghgngcwE4HsCuA7AJqSrkwC2AdAFYDOAvEA
 * isFolder=false
 * tabIdx=0
 * tabs=PQBwNghgng5gTgewK4DsAmpHwgWwHQBWAzkA
 * variant=default
 */
export const Decoder = {
  decodeString: function (inputString: string) {
    const qs: Partial<IParsedQuery> = parseQuery(inputString);
    return {
      chap: qs.chap,
      exec: qs.exec,
      files: qs.files,
      isFolder: qs.isFolder,
      tabIdx: qs.tabIdx,
      tabs: qs.tabs,
      variant: qs.variant,
      prgrm: qs.prgrm,
      ext: qs.ext
    };
  },

  decodeJSON: function (inputJSON: string) {
    const jsonObject = JSON.parse(inputJSON);
    return jsonObject.data;
  }
};

export async function resetConfig(
  configObj: programConfig,
  handlers: {
    handleChapterSelect: (chapter: Chapter, variant: Variant) => void;
    handleChangeExecTime: (execTime: number) => void;
  },
  workspaceLocation: WorkspaceLocation,
  dispatch: Dispatch<AnyAction>,
  fileSystem: FSModule | null
) {
  const chapter = convertParamToInt(configObj.chap?.toString()) ?? undefined;
  if (chapter === Chapter.FULL_JS) {
    showFullJSWarningOnUrlLoad();
  } else if (chapter === Chapter.FULL_TS) {
    showFulTSWarningOnUrlLoad();
  } else {
    if (chapter === Chapter.HTML) {
      const continueToHtml = await showHTMLDisclaimer();
      if (!continueToHtml) {
        return;
      }
    }

    // For backward compatibility with old share links - 'prgrm' is no longer used.
    const program =
      configObj.prgrm === undefined ? '' : decompressFromEncodedURIComponent(configObj.prgrm);

    // By default, create just the default file.
    const defaultFilePath = getDefaultFilePath(workspaceLocation);
    const files: Record<string, string> =
      configObj.files === undefined
        ? {
            [defaultFilePath]: program
          }
        : parseQuery(decompressFromEncodedURIComponent(configObj.files));
    if (fileSystem !== null) {
      await overwriteFilesInWorkspace(workspaceLocation, fileSystem, files);
    }

    // BrowserFS does not provide a way of listening to changes in the file system, which makes
    // updating the file system view troublesome. To force the file system view to re-render
    // (and thus display the updated file system), we first disable Folder mode.
    dispatch(setFolderMode(workspaceLocation, false));
    const isFolderModeEnabled = convertParamToBoolean(configObj.isFolder?.toString()) ?? false;

    // If Folder mode should be enabled, enabling it after disabling it earlier will cause the
    // newly-added files to be shown. Note that this has to take place after the files are
    // already added to the file system.
    dispatch(setFolderMode(workspaceLocation, isFolderModeEnabled));

    // By default, open a single editor tab containing the default playground file.
    const editorTabFilePaths = configObj.tabs
      ?.split(',')
      .map(decompressFromEncodedURIComponent) ?? [defaultFilePath];

    // Remove all editor tabs before populating with the ones from the query string.
    dispatch(
      removeEditorTabsForDirectory(workspaceLocation, WORKSPACE_BASE_PATHS[workspaceLocation])
    );
    // Add editor tabs from the query string.
    editorTabFilePaths.forEach(filePath =>
      // Fall back on the empty string if the file contents do not exist.
      dispatch(addEditorTab(workspaceLocation, filePath, files[filePath] ?? ''))
    );

    // By default, use the first editor tab.
    const activeEditorTabIndex = convertParamToInt(configObj.tabIdx?.toString()) ?? 0;
    dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex));
    if (chapter) {
      // TODO: To migrate the state logic away from playgroundSourceChapter
      //       and playgroundSourceVariant into the language config instead
      const languageConfig = getLanguageConfig(chapter, configObj.variant as Variant);
      handlers.handleChapterSelect(chapter, languageConfig.variant);
      // Hardcoded for Playground only for now, while we await workspace refactoring
      // to decouple the SicpWorkspace from the Playground.
      dispatch(playgroundConfigLanguage(languageConfig));
    }

    const execTime = Math.max(
      convertParamToInt(configObj.exec?.toString() || '1000') || 1000,
      1000
    );
    if (execTime) {
      handlers.handleChangeExecTime(execTime);
    }
  }
}
