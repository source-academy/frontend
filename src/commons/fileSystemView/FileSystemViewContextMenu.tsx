import { Classes } from '@blueprintjs/core';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import classNames from 'classnames';
import React from 'react';
import classes from 'src/styles/ContextMenu.module.scss';

type Props = {
  children?: JSX.Element;
  className?: string;
  createNewFile?: () => void;
  createNewDirectory?: () => void;
  open?: () => void;
  rename?: () => void;
  remove?: () => void;
  disableEditing?: boolean;
};

const FileSystemViewContextMenu: React.FC<Props> = ({
  children,
  className,
  createNewFile,
  createNewDirectory,
  open,
  rename,
  remove,
  disableEditing
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
      {!disableEditing && (
        <ControlledMenu
          menuClassName={classNames(Classes.CARD, Classes.DARK, classes['context-menu'])}
          {...menuProps}
          anchorPoint={anchorPoint}
          onClose={() => toggleMenu(false)}
        >
          <MenuItem className={classes['context-menu-item']} onClick={createNewFile}>
            New File
          </MenuItem>
          <MenuItem className={classes['context-menu-item']} onClick={createNewDirectory}>
            New Directory
          </MenuItem>
          {open && (
            <MenuItem className={classes['context-menu-item']} onClick={open}>
              Open
            </MenuItem>
          )}
          {rename && (
            <MenuItem className={classes['context-menu-item']} onClick={rename}>
              Rename
            </MenuItem>
          )}
          {remove && (
            <MenuItem className={classes['context-menu-item']} onClick={remove}>
              Delete
            </MenuItem>
          )}
        </ControlledMenu>
      )}
    </div>
  );
};

export default FileSystemViewContextMenu;
