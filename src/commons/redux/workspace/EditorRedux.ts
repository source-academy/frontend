import { createSlice,PayloadAction } from "@reduxjs/toolkit"
import { HighlightedLines, Position } from "src/commons/editor/EditorTypes"
import { EditorTabState } from "src/commons/workspace/WorkspaceTypes"

export type EditorState = {
  readonly activeEditorTabIndex: number | null
  readonly editorSessionId: string
  readonly editorTabs: EditorTabState[]

  readonly isEditorAutorun: boolean
  readonly isEditorReadonly: boolean
}

export const getDefaultEditorState = (defaultTabs: EditorTabState[] = []): EditorState => ({
  activeEditorTabIndex: 0,
  editorSessionId: '',
  editorTabs: defaultTabs,
  isEditorAutorun: false,
  isEditorReadonly: false
})

export const getEditorSlice = (defaultTabs: EditorTabState[] = []) => createSlice({
  name: 'editor',
  initialState: getDefaultEditorState(defaultTabs),
  reducers: {
    addEditorTab: {
      prepare: (filePath: string, editorValue: string) => ({ payload: { filePath, editorValue }}),
      reducer(state, { payload }: PayloadAction<{ filePath: string, editorValue: string}>) {
        const { filePath, editorValue } = payload;

        const editorTabs = state.editorTabs;
        const openedEditorTabIndex = editorTabs.findIndex(
          (editorTab: EditorTabState) => editorTab.filePath === filePath
        );
        const fileIsAlreadyOpen = openedEditorTabIndex !== -1;
        if (fileIsAlreadyOpen) {
          // If the file is already opened just swap to the tab
          state.activeEditorTabIndex = openedEditorTabIndex
          return
        }

        state.editorTabs.push({
          filePath,
          value: editorValue,
          highlightedLines: [],
          breakpoints: []
        })

        // Check if this works properly
        state.activeEditorTabIndex = state.editorTabs.length + 1
      }
    },
    moveCursor: {
      prepare: (editorTabIndex: number, newCursorPosition: Position) => ({ payload: { editorTabIndex, newCursorPosition }}),
      reducer(state, { payload }: PayloadAction<{ editorTabIndex: number, newCursorPosition: Position }>) {
        const { editorTabIndex, newCursorPosition } = payload;
        if (editorTabIndex < 0) {
          throw new Error('Editor tab index must be non-negative!');
        }
        if (editorTabIndex >= state.editorTabs.length) {
          throw new Error('Editor tab index must have a corresponding editor tab!');
        }

        state.editorTabs[editorTabIndex].newCursorPosition = newCursorPosition
      }
    },
    removeEditorTab(state, { payload: editorTabIndex }: PayloadAction<number>) {
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

      state.activeEditorTabIndex = newActiveEditorTabIndex
      state.editorTabs.splice(editorTabIndex, 1)
    },
    setEditorSessionId(state, { payload }: PayloadAction<string>) {
      state.editorSessionId = payload
    },
    setIsEditorAutorun(state, { payload }: PayloadAction<boolean>) {
      state.isEditorAutorun = payload
    },
    setIsEditorReadonly(state, { payload }: PayloadAction<boolean>) {
      state.isEditorReadonly = payload
    },
    shiftEditorTab: {
      prepare: (previousIndex: number, newIndex: number) => ({ payload: { previousIndex, newIndex }}),
      reducer(state, action: PayloadAction<{ previousIndex: number, newIndex: number}>) {
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
          state.activeEditorTabIndex === previousIndex
            ? newIndex
            : state.activeEditorTabIndex;
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
      }
    },
    updateActiveEditorTab(state, { payload: activeEditorTabOptions }: PayloadAction<Partial<EditorTabState> | undefined>) {
      const activeEditorTabIndex = state.activeEditorTabIndex;
      // Do not modify the workspace state if there is no active editor tab.
      if (activeEditorTabIndex === null) return 

      state.editorTabs[activeEditorTabIndex] = {
        ...state.editorTabs[activeEditorTabIndex],
        ...activeEditorTabOptions
      }
    },
    updateActiveEditorTabIndex(state, { payload: activeEditorTabIndex }: PayloadAction<number | null>) {
      if (activeEditorTabIndex !== null) {
        if (activeEditorTabIndex < 0) {
          throw new Error('Active editor tab index must be non-negative!');
        }
        if (activeEditorTabIndex >= state.editorTabs.length) {
          throw new Error('Active editor tab index must have a corresponding editor tab!');
        }
      }
      state.activeEditorTabIndex = activeEditorTabIndex
    },
    updateEditorBreakpoints: {
      prepare: (editorTabIndex: number, newBreakpoints: string[]) => ({ payload: { editorTabIndex, newBreakpoints }}),
      reducer(state, { payload }: PayloadAction<{ editorTabIndex: number, newBreakpoints: string[] }>) {
        if (payload.editorTabIndex < 0) {
          throw new Error('Editor tab index must be non-negative!');
        }
        if (payload.editorTabIndex >= state.editorTabs.length) {
          throw new Error('Editor tab index must have a corresponding editor tab!');
        }
        state.editorTabs[payload.editorTabIndex].breakpoints = payload.newBreakpoints
      }
    },
    updateEditorHighlightedLines: {
      prepare: (editorTabIndex: number, newHighlightedLines: HighlightedLines[]) => ({ payload: { editorTabIndex, newHighlightedLines }}),
      reducer(state, { payload }: PayloadAction<{ editorTabIndex: number, newHighlightedLines: HighlightedLines[] }>) {
        if (payload.editorTabIndex < 0) {
          throw new Error('Editor tab index must be non-negative!');
        }
        if (payload.editorTabIndex >= state.editorTabs.length) {
          throw new Error('Editor tab index must have a corresponding editor tab!');
        }
        state.editorTabs[payload.editorTabIndex].highlightedLines = payload.newHighlightedLines
      }
    },
    updateEditorHighlightedLinesAgenda: {
      prepare: (editorTabIndex: number, newHighlightedLines: HighlightedLines[]) => ({ payload: { editorTabIndex, newHighlightedLines }}),
      reducer(state, { payload }: PayloadAction<{ editorTabIndex: number, newHighlightedLines: HighlightedLines[] }>) {
        if (payload.editorTabIndex < 0) {
          throw new Error('Editor tab index must be non-negative!');
        }
        if (payload.editorTabIndex >= state.editorTabs.length) {
          throw new Error('Editor tab index must have a corresponding editor tab!');
        }
        state.editorTabs[payload.editorTabIndex].highlightedLines = payload.newHighlightedLines
      }
    },
    updateEditorValue: {
      prepare: (editorTabIndex: number, newEditorValue: string) => ({ payload: { editorTabIndex, newEditorValue }}),
      reducer(state, { payload }: PayloadAction<{ editorTabIndex: number, newEditorValue: string}>) {
        if (payload.editorTabIndex < 0) {
          throw new Error('Editor tab index must be non-negative!');
        }
        if (payload.editorTabIndex >= state.editorTabs.length) {
          throw new Error('Editor tab index must have a corresponding editor tab!');
        }
        state.editorTabs[payload.editorTabIndex].value = payload.newEditorValue
      }
    },
  }
})

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
