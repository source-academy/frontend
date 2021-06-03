import { Alignment, Drawer, Navbar, NavbarGroup, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import controlButton from 'src/commons/ControlButton';

import tocNavigation from '../../../features/sicp/data/toc-navigation.json';
import SicpToc from '../../../pages/sicp/subcomponents/SicpToc';
import { ControlBarTableOfContentsButton } from '../../controlBar/ControlBarTableOfContentsButton';

type SicpNavigationBarProps = OwnProps;

type OwnProps = {};

const SicpNavigationBar: React.FC<SicpNavigationBarProps> = props => {
  const [isTocOpen, setIsTocOpen] = React.useState(false);
  const { section } = useParams<{ section: string }>();
  const history = useHistory();

  const handleCloseToc = () => setIsTocOpen(false);

  const menuButton = React.useMemo(() => {
    const handleOpenToc = () => setIsTocOpen(true);
    return <ControlBarTableOfContentsButton key="toc" handleOpenToc={handleOpenToc} />;
  }, []);

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
      <Navbar className="NavigationBar secondary-navbar">
        <NavbarGroup align={Alignment.LEFT}>{[menuButton]}</NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>{[prevButton, nextButton]}</NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps}>
        <SicpToc handleCloseToc={handleCloseToc} location="sidebar" />
      </Drawer>
    </>
  );
};

export default SicpNavigationBar;
