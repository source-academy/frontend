import { Action } from '@reduxjs/toolkit';
import { HighlightedLines, Position } from 'src/commons/editor/EditorTypes';

import { buildReducer, createActions } from '../../utils';
import { EditorTabState, getDefaultEditorState } from '../WorkspaceStateTypes';

export const editorActions = createActions('editorBase', {
  addEditorTab: (filePath: string, editorValue: string) => ({ filePath, editorValue }),
  moveCursor: (editorTabIndex: number, newCursorPosition: Position) => ({
    editorTabIndex,
    newCursorPosition
  }),
  removeEditorTab: (editorTabIndex: number) => editorTabIndex,
  removeEditorTabForFile: (removedFilePath: string) => removedFilePath,
  removeEditorTabsForDirectory: (removedDirectoryPath: string) => removedDirectoryPath,
  renameEditorTabForFile: (oldPath: string, newPath: string) => ({ oldPath, newPath }),
  renameEditorTabsForDirectory: (oldPath: string, newPath: string) => ({ oldPath, newPath }),
  setEditorSessionId: (editorSessionId: string) => editorSessionId,
  setIsEditorAutorun: (isEditorAutorun: boolean) => isEditorAutorun,
  setIsEditorReadonly: (isEditorReadonly: boolean) => isEditorReadonly,
  setFolderMode: (value: boolean) => value,
  shiftEditorTab: (previousIndex: number, newIndex: number) => ({ previousIndex, newIndex }),
  toggleEditorAutorun: 0,
  toggleFolderMode: 0,
  updateActiveEditorTab: (editorOptions: Partial<EditorTabState> | undefined) => editorOptions,
  updateActiveEditorTabIndex: (activeEditorTabIndex: number | null) => activeEditorTabIndex,
  updateEditorBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => ({
    editorTabIndex,
    newBreakpoints
  }),
  updateEditorHighlightedLines: (
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => ({ editorTabIndex, newHighlightedLines }),
  updateEditorHighlightedLinesAgenda: (
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => ({ editorTabIndex, newHighlightedLines }),
  updateEditorValue: (editorTabIndex: number, newEditorValue: string) => ({
    editorTabIndex,
    newEditorValue
  })
});

export const isEditorAction = (action: Action): action is ReturnType<(typeof editorActions)[keyof typeof editorActions]> => action.type.startsWith('editorBase')

export const editorActionNames = Object.keys(editorActions) as Array<keyof typeof editorActions>;

// export const {
//   actions: test2,
//   getReducer: getEditorReducer
// } = buildReducer2(
//   'editorBase',
//   (defaultTabs: EditorTabState[]) => getDefaultEditorState(defaultTabs),
//   {
//     addEditorTab: {
//       prepare: (filePath: string, editorValue: string) => ({ payload: { filePath, editorValue }}),
//       reducer(state, { payload }: PayloadAction<{ filePath: string, editorValue: string }>) {

//       }
//     }
//   }
// )

// test2.addEditorTab()

export const getEditorReducer = (defaultTabs: EditorTabState[] = []) =>
  buildReducer(getDefaultEditorState(defaultTabs), editorActions, {
    addEditorTab(state, { payload }) {
      const { filePath, editorValue } = payload;

      const editorTabs = state.editorTabs;
      const openedEditorTabIndex = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === filePath
      );
      const fileIsAlreadyOpen = openedEditorTabIndex !== -1;
      if (fileIsAlreadyOpen) {
        // If the file is already opened just swap to the tab
        state.activeEditorTabIndex = openedEditorTabIndex;
        return;
      }

      state.editorTabs.push({
        filePath,
        value: editorValue,
        highlightedLines: [],
        breakpoints: []
      });

      // Check if this works properly
      state.activeEditorTabIndex = state.editorTabs.length + 1;
    },
    moveCursor(state, { payload }) {
      const { editorTabIndex, newCursorPosition } = payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state.editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state.editorTabs[editorTabIndex].newCursorPosition = newCursorPosition;
    },
    removeEditorTab(state, { payload: editorTabIndex }) {
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state.editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      const activeEditorTabIndex = state.activeEditorTabIndex;
      const newActiveEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
        activeEditorTabIndex,
        editorTabIndex,
        state.editorTabs.length - 1
      );

      state.activeEditorTabIndex = newActiveEditorTabIndex;
      state.editorTabs.splice(editorTabIndex, 1);
    },
    removeEditorTabForFile(state, { payload: removedFilePath }) {
      const editorTabs = state.editorTabs;
      const editorTabIndexToRemove = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === removedFilePath
      );
      if (editorTabIndexToRemove === -1) return;

      const newEditorTabs = editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== editorTabIndexToRemove
      );

      const activeEditorTabIndex = state.activeEditorTabIndex;
      state.activeEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
        activeEditorTabIndex,
        editorTabIndexToRemove,
        newEditorTabs.length
      );
      state.editorTabs = newEditorTabs;
    },
    removeEditorTabsForDirectory(state, { payload: removedDirectoryPath }) {
      const editorTabs = state.editorTabs;
      const editorTabIndicesToRemove = editorTabs
        .map((editorTab: EditorTabState, index: number) => {
          if (editorTab.filePath?.startsWith(removedDirectoryPath)) {
            return index;
          }
          return null;
        })
        .filter((index: number | null): index is number => index !== null);
      if (editorTabIndicesToRemove.length === 0) return;

      let newActiveEditorTabIndex = state.activeEditorTabIndex;
      const newEditorTabs = [...editorTabs];
      for (let i = editorTabIndicesToRemove.length - 1; i >= 0; i--) {
        const editorTabIndexToRemove = editorTabIndicesToRemove[i];
        newEditorTabs.splice(editorTabIndexToRemove, 1);
        newActiveEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
          newActiveEditorTabIndex,
          editorTabIndexToRemove,
          newEditorTabs.length
        );
      }

      state.activeEditorTabIndex = newActiveEditorTabIndex;
      state.editorTabs = newEditorTabs;
    },
    renameEditorTabsForDirectory(state, { payload: { oldPath, newPath } }) {
      const editorTabs = state.editorTabs;
      const newEditorTabs = editorTabs.map((editorTab: EditorTabState) =>
        editorTab.filePath?.startsWith(oldPath)
          ? {
              ...editorTab,
              filePath: editorTab.filePath?.replace(oldPath, newPath)
            }
          : editorTab
      );

      state.editorTabs = newEditorTabs;
    },
    renameEditorTabForFile(state, { payload: { oldPath, newPath } }) {
      const editorTabs = state.editorTabs;
      const newEditorTabs = editorTabs.map((editorTab: EditorTabState) =>
        editorTab.filePath === oldPath
          ? {
              ...editorTab,
              filePath: newPath
            }
          : editorTab
      );

      state.editorTabs = newEditorTabs;
    },
    setEditorSessionId(state, { payload }) {
      state.editorSessionId = payload;
    },
    setIsEditorAutorun(state, { payload }) {
      state.isEditorAutorun = payload;
    },
    setIsEditorReadonly(state, { payload }) {
      state.isEditorReadonly = payload;
    },
    setFolderMode(state, { payload }) {
      state.isFolderModeEnabled = payload;
    },
    shiftEditorTab(state, action) {
      const { previousIndex, newIndex } = action.payload;
      if (previousIndex < 0) {
        throw new Error('Previous editor tab index must be non-negative!');
      }
      if (previousIndex >= state.editorTabs.length) {
        throw new Error('Previous editor tab index must have a corresponding editor tab!');
      }
      if (newIndex < 0) {
        throw new Error('New editor tab index must be non-negative!');
      }
      if (newIndex >= state.editorTabs.length) {
        throw new Error('New editor tab index must have a corresponding editor tab!');
      }
      state.activeEditorTabIndex =
        state.activeEditorTabIndex === previousIndex ? newIndex : state.activeEditorTabIndex;
      const editorTabs = state.editorTabs;
      const shiftedEditorTab = editorTabs[previousIndex];
      const filteredEditorTabs = editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== previousIndex
      );
      state.editorTabs = [
        ...filteredEditorTabs.slice(0, newIndex),
        shiftedEditorTab,
        ...filteredEditorTabs.slice(newIndex)
      ];
    },
    toggleEditorAutorun(state) {
      state.isEditorAutorun = !state.isEditorAutorun;
    },
    toggleFolderMode(state) {
      state.isFolderModeEnabled = !state.isFolderModeEnabled;
    },
    updateActiveEditorTab(state, { payload: activeEditorTabOptions }) {
      const activeEditorTabIndex = state.activeEditorTabIndex;
      // Do not modify the workspace state if there is no active editor tab.
      if (activeEditorTabIndex === null) return;

      state.editorTabs[activeEditorTabIndex] = {
        ...state.editorTabs[activeEditorTabIndex],
        ...activeEditorTabOptions
      };
    },
    updateActiveEditorTabIndex(state, { payload: activeEditorTabIndex }) {
      if (activeEditorTabIndex !== null) {
        if (activeEditorTabIndex < 0) {
          throw new Error('Active editor tab index must be non-negative!');
        }
        if (activeEditorTabIndex >= state.editorTabs.length) {
          throw new Error('Active editor tab index must have a corresponding editor tab!');
        }
      }
      state.activeEditorTabIndex = activeEditorTabIndex;
    },
    updateEditorBreakpoints(state, { payload }) {
      if (payload.editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (payload.editorTabIndex >= state.editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }
      state.editorTabs[payload.editorTabIndex].breakpoints = payload.newBreakpoints;
    },
    updateEditorHighlightedLines(state, { payload }) {
      if (payload.editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (payload.editorTabIndex >= state.editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }
      state.editorTabs[payload.editorTabIndex].highlightedLines = payload.newHighlightedLines;
    },
    updateEditorHighlightedLinesAgenda(state, { payload }) {
      if (payload.editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (payload.editorTabIndex >= state.editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }
      state.editorTabs[payload.editorTabIndex].highlightedLines = payload.newHighlightedLines;
    },
    updateEditorValue(state, { payload }) {
      if (payload.editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (payload.editorTabIndex >= state.editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }
      state.editorTabs[payload.editorTabIndex].value = payload.newEditorValue;
    }
  });

const getNextActiveEditorTabIndexAfterTabRemoval = (
  activeEditorTabIndex: number | null,
  removedEditorTabIndex: number,
  newEditorTabsLength: number
) => {
  return activeEditorTabIndex !== removedEditorTabIndex
    ? // If the active editor tab is not the one that is removed,
      // the active editor tab remains the same if its index is
      // less than the removed editor tab index or null.
      activeEditorTabIndex === null || activeEditorTabIndex < removedEditorTabIndex
      ? activeEditorTabIndex
      : // Otherwise, the active editor tab index needs to have 1
        // subtracted because every tab to the right of the editor
        // tab being removed has their index decremented by 1.
        activeEditorTabIndex - 1
    : newEditorTabsLength === 0
    ? // If there are no editor tabs after removal, there cannot
      // be an active editor tab.
      null
    : removedEditorTabIndex === 0
    ? // If the removed editor tab is the leftmost tab, the active
      // editor tab will be the new leftmost tab.
      0
    : // Otherwise, the active editor tab will be the tab to the
      // left of the removed tab.
      removedEditorTabIndex - 1;
};
