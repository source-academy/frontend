import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import React from 'react';

export type FileSystemViewContextMenuProps = {
  children: JSX.Element;
};

const FileSystemViewContextMenu: React.FC<FileSystemViewContextMenuProps> = (
  props: FileSystemViewContextMenuProps
) => {
  const { children } = props;
  const [menuProps, toggleMenu] = useMenuState();
  const [anchorPoint, setAnchorPoint] = React.useState({ x: 0, y: 0 });

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  return (
    <div onContextMenu={onContextMenu}>
      {children}
      <ControlledMenu {...menuProps} anchorPoint={anchorPoint} onClose={() => toggleMenu(false)}>
        <MenuItem>New File</MenuItem>
        <MenuItem>New Directory</MenuItem>
      </ControlledMenu>
    </div>
  );
};

export default FileSystemViewContextMenu;
