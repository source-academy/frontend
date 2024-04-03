import { Classes } from '@blueprintjs/core';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import classNames from 'classnames';
import React from 'react';
import classes from 'src/styles/ContextMenu.module.scss';

type Props = {
  children?: JSX.Element;
  className?: string;
  isContextMenuDisabled: boolean;
  createNewFile?: () => void;
  createNewDirectory?: () => void;
  open?: () => void;
  rename?: () => void;
  remove?: () => void;
};

const FileSystemViewContextMenu: React.FC<Props> = ({
  children,
  className,
  isContextMenuDisabled,
  createNewFile,
  createNewDirectory,
  open,
  rename,
  remove
}) => {
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
        menuClassName={classNames(Classes.CARD, Classes.DARK, classes['context-menu'])}
        {...menuProps}
        anchorPoint={anchorPoint}
        onClose={() => toggleMenu(false)}
      >
        {createNewFile && (
          <MenuItem 
            className={isContextMenuDisabled ? classes['context-menu-item-disabled'] : classes['context-menu-item']} 
            onClick={createNewFile} 
            disabled={isContextMenuDisabled}
          >
            New File
          </MenuItem>
        )}
        {createNewDirectory && (
          <MenuItem 
            className={isContextMenuDisabled ? classes['context-menu-item-disabled'] : classes['context-menu-item']} 
            onClick={createNewDirectory} 
            disabled={isContextMenuDisabled}
          >
            New Directory
          </MenuItem>
        )}
        {open && (
          <MenuItem 
            className={isContextMenuDisabled ? classes['context-menu-item-disabled'] : classes['context-menu-item']} 
            onClick={open} 
            disabled={isContextMenuDisabled}
          >
            Open
          </MenuItem>
        )}
        {rename && (
          <MenuItem 
            className={isContextMenuDisabled ? classes['context-menu-item-disabled'] : classes['context-menu-item']} 
            onClick={rename} 
            disabled={isContextMenuDisabled}
          >
            Rename
          </MenuItem>
        )}
        {remove && (
          <MenuItem 
            className={isContextMenuDisabled ? classes['context-menu-item-disabled'] : classes['context-menu-item']} 
            onClick={remove} 
            disabled={isContextMenuDisabled}
          >
            Delete
          </MenuItem>
        )}
      </ControlledMenu>
    </div>
  );
};

export default FileSystemViewContextMenu;
