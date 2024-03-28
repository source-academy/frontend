import { FSModule } from 'browserfs/dist/node/core/FS';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import { IParsedQuery, parseQuery } from '../../commons/utils/QueryHelper';
import { convertParamToBoolean, convertParamToInt } from '../../commons/utils/ParamParseHelper';
import {
    showFullJSWarningOnUrlLoad,
    showFulTSWarningOnUrlLoad,
    showHTMLDisclaimer
  } from 'src/commons/utils/WarningDialogHelper';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { getDefaultFilePath, getLanguageConfig } from 'src/commons/application/ApplicationTypes';
import { overwriteFilesInWorkspace } from 'src/commons/fileSystem/utils';
import { setFolderMode, removeEditorTabsForDirectory, addEditorTab, updateActiveEditorTabIndex } from 'src/commons/workspace/WorkspaceActions';
import { playgroundConfigLanguage } from 'src/features/playground/PlaygroundActions';
import { WORKSPACE_BASE_PATHS } from '../fileSystem/createInBrowserFileSystem';
import { Chapter, Variant } from 'js-slang/dist/types';


export type programConfig = {
    isFolder: string | undefined,
    tabs: string | undefined,
    tabIdx: string | undefined,
    chap: string | undefined,
    variant: string | undefined,
    ext: string | undefined,
    exec: string | undefined,
    files: string | undefined,
    prgrm: string | undefined
}
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
export var Decoder = {
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
        const program =  configObj.prgrm === undefined ? '' : decompressFromEncodedURIComponent(configObj.prgrm);

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

        dispatch(setFolderMode(workspaceLocation, false));
        const isFolderModeEnabled = convertParamToBoolean(configObj.isFolder?.toString()) ?? false;
        dispatch(setFolderMode(workspaceLocation, isFolderModeEnabled));

        const editorTabFilePaths = configObj.tabs?.split(',').map(decompressFromEncodedURIComponent) ?? [
            defaultFilePath
        ];
        
        dispatch(
            removeEditorTabsForDirectory(workspaceLocation, WORKSPACE_BASE_PATHS[workspaceLocation])
        );

        editorTabFilePaths.forEach(filePath =>
            dispatch(addEditorTab(workspaceLocation, filePath, files[filePath] ?? ''))
        );

        const activeEditorTabIndex = convertParamToInt(configObj.tabIdx?.toString()) ?? 0;
        dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex));
        if (chapter) {
            const languageConfig = getLanguageConfig(chapter, configObj.variant as Variant);
            handlers.handleChapterSelect(chapter, languageConfig.variant);
            dispatch(playgroundConfigLanguage(languageConfig));
        }

        const execTime = Math.max(convertParamToInt(configObj.exec?.toString() || '1000') || 1000, 1000);
        if (execTime) {
            handlers.handleChangeExecTime(execTime);
        }
    }
}