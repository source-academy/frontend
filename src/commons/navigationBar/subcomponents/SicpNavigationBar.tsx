import { Alignment, Drawer, Navbar, NavbarGroup, Position } from '@blueprintjs/core';
import * as React from 'react';

import SicpToc from '../../../pages/sicp/subcomponents/SicpToc';
import { ControlBarTableOfContentsButton } from '../../controlBar/ControlBarTableOfContentsButton';

type ControlBarProps = OwnProps;

type OwnProps = {};

const SicpControlBar: React.FC<ControlBarProps> = props => {
  const [isTocOpen, setIsTocOpen] = React.useState(false);

  const handleCloseToc = () => setIsTocOpen(false);

  const menuButton = React.useMemo(() => {
    const handleOpenToc = () => setIsTocOpen(true);
    return <ControlBarTableOfContentsButton key="toc" handleOpenToc={handleOpenToc} />;
  }, []);

  const drawerProps = {
    onClose: handleCloseToc,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    isOpen: isTocOpen,
    position: Position.LEFT,
    size: '500px',
    usePortal: false
  };

  return (
    <>
      <Navbar className="NavigationBar secondary-navbar">
        <NavbarGroup align={Alignment.LEFT}>{menuButton}</NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps}>
        <SicpToc handleCloseToc={handleCloseToc} location="sidebar" />
      </Drawer>
    </>
  );
};

export default SicpControlBar;
