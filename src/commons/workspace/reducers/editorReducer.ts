import { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import WorkspaceActions from '../WorkspaceActions';
import { getWorkspaceLocation } from '../WorkspaceReducer';
import { EditorTabState, WorkspaceManagerState } from '../WorkspaceTypes';

export const handleEditorActions = (builder: ActionReducerMapBuilder<WorkspaceManagerState>) => {
  builder
    .addCase(WorkspaceActions.setFolderMode, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isFolderModeEnabled = action.payload.isFolderModeEnabled;
    })
    .addCase(WorkspaceActions.updateActiveEditorTabIndex, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const activeEditorTabIndex = action.payload.activeEditorTabIndex;
      if (activeEditorTabIndex !== null) {
        if (activeEditorTabIndex < 0) {
          throw new Error('Active editor tab index must be non-negative!');
        }
        if (activeEditorTabIndex >= state[workspaceLocation].editorTabs.length) {
          throw new Error('Active editor tab index must have a corresponding editor tab!');
        }
      }

      state[workspaceLocation].activeEditorTabIndex = activeEditorTabIndex;
    })
    .addCase(WorkspaceActions.updateActiveEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { activeEditorTabOptions } = action.payload;
      const activeEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      // Do not modify the workspace state if there is no active editor tab.
      if (activeEditorTabIndex === null) {
        return;
      }

      const updatedEditorTabs = [...state[workspaceLocation].editorTabs];
      updatedEditorTabs[activeEditorTabIndex] = {
        ...updatedEditorTabs[activeEditorTabIndex],
        ...activeEditorTabOptions
      };

      state[workspaceLocation].editorTabs = updatedEditorTabs;
    })
    .addCase(WorkspaceActions.updateEditorValue, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newEditorValue } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].value = newEditorValue;
    })
    .addCase(WorkspaceActions.setEditorBreakpoint, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newBreakpoints } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].breakpoints = newBreakpoints;
    })
    .addCase(WorkspaceActions.setEditorHighlightedLines, (state, action) => {
      // TODO: This and the subsequent reducer achieves the same thing?
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newHighlightedLines } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].highlightedLines = newHighlightedLines;
    })
    .addCase(WorkspaceActions.setEditorHighlightedLinesControl, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newHighlightedLines } = action.payload;

      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].highlightedLines = newHighlightedLines;
    })
    .addCase(WorkspaceActions.moveCursor, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newCursorPosition } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].newCursorPosition = newCursorPosition;
    })
    .addCase(WorkspaceActions.addEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { filePath, editorValue } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const openedEditorTabIndex = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === filePath
      );
      const fileIsAlreadyOpen = openedEditorTabIndex !== -1;
      if (fileIsAlreadyOpen) {
        state[workspaceLocation].activeEditorTabIndex = openedEditorTabIndex;
        return;
      }

      const newEditorTab: EditorTabState = {
        filePath,
        value: editorValue,
        highlightedLines: [],
        breakpoints: []
      };
      editorTabs.push(newEditorTab);
      // Set the newly added editor tab as the active tab.
      const newActiveEditorTabIndex = editorTabs.length - 1;
      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
    })
    .addCase(WorkspaceActions.shiftEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { previousEditorTabIndex, newEditorTabIndex } = action.payload;
      if (previousEditorTabIndex < 0) {
        throw new Error('Previous editor tab index must be non-negative!');
      }
      if (previousEditorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Previous editor tab index must have a corresponding editor tab!');
      }
      if (newEditorTabIndex < 0) {
        throw new Error('New editor tab index must be non-negative!');
      }
      if (newEditorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('New editor tab index must have a corresponding editor tab!');
      }

      const newActiveEditorTabIndex =
        state[workspaceLocation].activeEditorTabIndex === previousEditorTabIndex
          ? newEditorTabIndex
          : state[workspaceLocation].activeEditorTabIndex;
      const editorTabs = state[workspaceLocation].editorTabs;
      const shiftedEditorTab = editorTabs[previousEditorTabIndex];
      const filteredEditorTabs = editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== previousEditorTabIndex
      );
      const newEditorTabs = [
        ...filteredEditorTabs.slice(0, newEditorTabIndex),
        shiftedEditorTab,
        ...filteredEditorTabs.slice(newEditorTabIndex)
      ];

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(WorkspaceActions.removeEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const editorTabIndex = action.payload.editorTabIndex;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }
      const newEditorTabs = state[workspaceLocation].editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== editorTabIndex
      );

      const activeEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      const newActiveEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
        activeEditorTabIndex,
        editorTabIndex,
        newEditorTabs.length
      );

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(WorkspaceActions.removeEditorTabForFile, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const removedFilePath = action.payload.removedFilePath;

      const editorTabs = state[workspaceLocation].editorTabs;
      const editorTabIndexToRemove = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === removedFilePath
      );
      if (editorTabIndexToRemove === -1) {
        return;
      }
      const newEditorTabs = editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== editorTabIndexToRemove
      );

      const activeEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      const newActiveEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
        activeEditorTabIndex,
        editorTabIndexToRemove,
        newEditorTabs.length
      );

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(WorkspaceActions.removeEditorTabsForDirectory, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const removedDirectoryPath = action.payload.removedDirectoryPath;

      const editorTabs = state[workspaceLocation].editorTabs;
      const editorTabIndicesToRemove = editorTabs
        .map((editorTab: EditorTabState, index: number) => {
          if (editorTab.filePath?.startsWith(removedDirectoryPath)) {
            return index;
          }
          return null;
        })
        .filter((index: number | null): index is number => index !== null);
      if (editorTabIndicesToRemove.length === 0) {
        return;
      }

      let newActiveEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
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

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(WorkspaceActions.renameEditorTabForFile, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { oldFilePath, newFilePath } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const tabToEdit = editorTabs.find(({ filePath }) => filePath === oldFilePath);
      if (tabToEdit) {
        tabToEdit.filePath = newFilePath;
      }
    })
    .addCase(WorkspaceActions.renameEditorTabsForDirectory, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { oldDirectoryPath, newDirectoryPath } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const newEditorTabs = editorTabs.map((editorTab: EditorTabState) =>
        editorTab.filePath?.startsWith(oldDirectoryPath)
          ? {
              ...editorTab,
              filePath: editorTab.filePath?.replace(oldDirectoryPath, newDirectoryPath)
            }
          : editorTab
      );

      state[workspaceLocation].editorTabs = newEditorTabs;
    });
};

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
