import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import React from 'react';

export type FileSystemViewContextMenuProps = {
  children: JSX.Element;
  createNewFile?: () => void;
  createNewDirectory?: () => void;
  rename?: () => void;
};

const FileSystemViewContextMenu: React.FC<FileSystemViewContextMenuProps> = (
  props: FileSystemViewContextMenuProps
) => {
  const { children, createNewFile, createNewDirectory, rename } = props;
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
        {createNewFile && <MenuItem onClick={createNewFile}>New File</MenuItem>}
        {createNewDirectory && <MenuItem onClick={createNewDirectory}>New Directory</MenuItem>}
        {rename && <MenuItem onClick={rename}>Rename</MenuItem>}
      </ControlledMenu>
    </div>
  );
};

export default FileSystemViewContextMenu;
