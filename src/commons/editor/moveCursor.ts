import type { Position } from './EditorTypes';

type AceEditorInstance = {
  selection: { clearSelection(): void };
  moveCursorToPosition(position: Position): void;
  renderer: { showCursor(): void; scrollCursorIntoView(position: Position, offset: number): void };
};

/** Puts the cursor at `position` and brings it into view. */
export const moveCursor = (editor: AceEditorInstance, position: Position) => {
  editor.selection.clearSelection();
  editor.moveCursorToPosition(position);
  editor.renderer.showCursor();
  editor.renderer.scrollCursorIntoView(position, 0.5);
};
