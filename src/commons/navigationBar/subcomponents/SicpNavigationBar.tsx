import { Alignment, Drawer, Navbar, NavbarGroup, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import controlButton from 'src/commons/ControlButton';

import tocNavigation from '../../../features/sicp/data/toc-navigation.json';
import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import SicpToc from '../../../pages/sicp/subcomponents/SicpToc';

/**
 * Secondary navbar for SICP, should only be displayed when on pages related to interactive /SICP.
 */
const SicpNavigationBar: React.FC = () => {
  const [isTocOpen, setIsTocOpen] = React.useState(false);
  const { section } = useParams<{ section: string }>();
  const history = useHistory();

  const handleCloseToc = () => setIsTocOpen(false);

  // Button to open table of contents
  const tocButton = React.useMemo(() => {
    const handleOpenToc = () => setIsTocOpen(true);
    return <TableOfContentsButton key="toc" handleOpenToc={handleOpenToc} />;
  }, []);

  // Previous button only displayed when next page is valid.
  const prevButton = React.useMemo(() => {
    const sect = tocNavigation[section];
    if (!sect) {
      return;
    }

    const prev = sect['prev'];
    if (!prev) {
      return;
    }

    const handlePrev = () => {
      history.push('/interactive-sicp/' + prev);
    };

    return (
      prev && <div key="prev">{controlButton('Previous', IconNames.ARROW_LEFT, handlePrev)}</div>
    );
  }, [history, section]);

  // Next button only displayed when next page is valid.
  const nextButton = React.useMemo(() => {
    const sect = tocNavigation[section];
    if (!sect) {
      return;
    }

    const next = sect['next'];
    if (!next) {
      return;
    }

    const handleNext = () => {
      history.push('/interactive-sicp/' + next);
    };

    return (
      next && (
        <div key="next">
          {controlButton('Next', IconNames.ARROW_RIGHT, handleNext, { iconOnRight: true })}
        </div>
      )
    );
  }, [history, section]);

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
      <Navbar className="SicpNavigationBar secondary-navbar">
        <NavbarGroup align={Alignment.LEFT}>{[tocButton]}</NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>{[prevButton, nextButton]}</NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps} className="sicp-toc-drawer">
        <SicpToc handleCloseToc={handleCloseToc} />
      </Drawer>
    </>
  );
};

export default SicpNavigationBar;
