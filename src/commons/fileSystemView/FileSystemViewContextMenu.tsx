import { Classes } from '@blueprintjs/core';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import classNames from 'classnames';
import { useState } from 'react';

type Props = {
  children?: React.ReactElement;
  className?: string;
  createNewFile?: () => void;
  createNewDirectory?: () => void;
  open?: () => void;
  rename?: () => void;
  remove?: () => void;
};

function FileSystemViewContextMenu({
  children,
  className,
  createNewFile,
  createNewDirectory,
  open,
  rename,
  remove,
}: Props) {
  const [menuProps, toggleMenu] = useMenuState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  const menuItems = [
    createNewFile && { label: 'New File', onClick: createNewFile },
    createNewDirectory && { label: 'New Directory', onClick: createNewDirectory },
    open && { label: 'Open', onClick: open },
    rename && { label: 'Rename', onClick: rename },
    remove && { label: 'Delete', onClick: remove },
  ];

  return (
    <div className={className} onContextMenu={onContextMenu}>
      {children}
      <ControlledMenu
        menuClassName={classNames(
          Classes.CARD,
          Classes.DARK,
          'bg-(--cadet-color-1) px-px py-1 z-5',
        )}
        {...menuProps}
        anchorPoint={anchorPoint}
        onClose={() => toggleMenu(false)}
      >
        {menuItems.map(
          (item, index) =>
            item && (
              <MenuItem
                key={index}
                className="list-none select-none px-4 py-0.5 whitespace-nowrap hover:bg-(--cadet-color-3)"
                onClick={item.onClick}
              >
                {item.label}
              </MenuItem>
            ),
        )}
      </ControlledMenu>
    </div>
  );
}

export default FileSystemViewContextMenu;
