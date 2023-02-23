import { Classes } from '@blueprintjs/core';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import classNames from 'classnames';
import React from 'react';

export type FileSystemViewContextMenuProps = {
  children?: JSX.Element;
  className?: string;
  createNewFile?: () => void;
  createNewDirectory?: () => void;
  open?: () => void;
  rename?: () => void;
  remove?: () => void;
};

const FileSystemViewContextMenu: React.FC<FileSystemViewContextMenuProps> = (
  props: FileSystemViewContextMenuProps
) => {
  const { children, className, createNewFile, createNewDirectory, open, rename, remove } = props;
  const [menuProps, toggleMenu] = useMenuState();
  const [anchorPoint, setAnchorPoint] = React.useState({ x: 0, y: 0 });

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  return (
    <div className={className} onContextMenu={onContextMenu}>
      {children}
      <ControlledMenu
        menuClassName={classNames(Classes.CARD, Classes.DARK, 'context-menu')}
        {...menuProps}
        anchorPoint={anchorPoint}
        onClose={() => toggleMenu(false)}
      >
        {createNewFile && (
          <MenuItem className="context-menu-item" onClick={createNewFile}>
            New File
          </MenuItem>
        )}
        {createNewDirectory && (
          <MenuItem className="context-menu-item" onClick={createNewDirectory}>
            New Directory
          </MenuItem>
        )}
        {open && (
          <MenuItem className="context-menu-item" onClick={open}>
            Open
          </MenuItem>
        )}
        {rename && (
          <MenuItem className="context-menu-item" onClick={rename}>
            Rename
          </MenuItem>
        )}
        {remove && (
          <MenuItem className="context-menu-item" onClick={remove}>
            Delete
          </MenuItem>
        )}
      </ControlledMenu>
    </div>
  );
};

export default FileSystemViewContextMenu;
