import {
  Alignment,
  Drawer,
  Navbar,
  NavbarGroup,
  Position,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import { getNextPy, getPrevPy } from 'src/features/sicp/TableOfContentsHelperPy';

import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import SicpPyToc from '../../../pages/sicp/subcomponents/SicpPyToc';

function SicpPyNavigationBar() {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const prev = getPrevPy(section ?? '');
  const next = getNextPy(section ?? '');

  const handleNavigation = (sect: string) => navigate('/sicppy/' + sect);

  const tocButton = <TableOfContentsButton key="toc" handleOpenToc={() => setIsTocOpen(true)} />;

  const prevButton = prev && (
    <div key="prev">
      <ControlButton
        label="Previous"
        icon={IconNames.ARROW_LEFT}
        onClick={() => handleNavigation(prev)}
      />
    </div>
  );

  const nextButton = next && (
    <div key="next">
      <ControlButton
        label="Next"
        icon={IconNames.ARROW_RIGHT}
        onClick={() => handleNavigation(next)}
        options={{ iconOnRight: true }}
      />
    </div>
  );

  const drawerProps = {
    onClose: () => setIsTocOpen(false),
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    isOpen: isTocOpen,
    position: Position.LEFT,
    usePortal: false,
  };

  return (
    <>
      <Navbar className="SicpNavigationBar secondary-navbar">
        <NavbarGroup align={Alignment.START}>{tocButton}</NavbarGroup>
        <NavbarGroup align={Alignment.END}>{[prevButton, nextButton]}</NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps} className="sicp-toc-drawer">
        <SicpPyToc handleCloseToc={() => setIsTocOpen(false)} />
      </Drawer>
    </>
  );
}

export default SicpPyNavigationBar;
