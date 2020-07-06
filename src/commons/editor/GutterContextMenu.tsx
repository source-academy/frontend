import { Menu, MenuItem } from '@blueprintjs/core';
import * as React from 'react';

export type ContextMenuItems = 'toggleBreakpoint' | 'createCommentPrompt';

// This is the interface that needs to be defined
// It will be converted to a void function
export type ContextMenuHandler = (linenum: number) => void;

export interface ContextMenuProps {
  row: number;
  handlers: { [name in ContextMenuItems]?: ContextMenuHandler };
}

// TODO: disable creating comment prompt when assignment is not yet submitted.

export default function ContextMenu(props: ContextMenuProps) {
  const { handlers, row } = props;

  function tryGet(item: ContextMenuItems) {
    const fn = handlers[item] || ((row: number) => {});
    return () => fn(row);
  }

  return (
    <Menu onContextMenu={() => false}>
      <MenuItem icon="full-circle" text="Toggle Breakpoint" onClick={tryGet('toggleBreakpoint')} />
      <MenuItem icon="comment" text="Add comment" onClick={tryGet('createCommentPrompt')} />
    </Menu>
  );
}
