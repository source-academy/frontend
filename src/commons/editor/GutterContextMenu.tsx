import { Menu, MenuItem } from '@blueprintjs/core';
import * as React from 'react';

export type ContextMenuItems = "toggleBreakpoint" | "createCommentPrompt";

// This is the interface that needs to be defined
// It will be converted to a void function 
export type ContextMenuHandler = (linenum: number) => void;

export interface ContextMenuProps {
    handlers: { [name in ContextMenuItems]?: () => void };
}

// TODO: disable creating comment prompt when assignment is not yet submitted.

export default function ContextMenu(props: ContextMenuProps) {

    const { handlers } = props; 
    
    return (<Menu onContextMenu={() => false}>
          <MenuItem icon="full-circle" text="Toggle Breakpoint" onClick={ handlers.toggleBreakpoint }/>
          <MenuItem icon="comment" text="Add comment" onClick={ handlers.createCommentPrompt }/>
        </Menu>);
}