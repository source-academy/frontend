import { Alignment, Drawer, Navbar, NavbarGroup, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import { TableOfContentsButton } from '../../../features/sicp/TableOfContentsButton';
import { fetchSicpSearchData } from '../../../features/textbook/navigationBar/autocomplete/query';
import SearchAutocomplete from '../../../features/textbook/navigationBar/autocomplete/SearchAutocomplete';
import SicpToc from '../../../pages/sicp/subcomponents/SicpToc';

function SicpNavigationBar() {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const prev = getPrev(section ?? '');
  const next = getNext(section ?? '');

  const handleOpenToc = () => setIsTocOpen(true);
  const handleCloseToc = () => setIsTocOpen(false);

  const handleNavigation = (sect: string) => {
    navigate('/sicpjs/' + sect);
  };

  // Button to open table of contents
  const tocButton = <TableOfContentsButton key="toc" handleOpenToc={handleOpenToc} />;

  // Previous button only displayed when next page is valid.
  const prevButton = prev && (
    <div key="prev">
      <ControlButton
        label="Previous"
        icon={IconNames.ARROW_LEFT}
        onClick={() => handleNavigation(prev)}
      />
    </div>
  );

  // Next button only displayed when next page is valid.
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
    onClose: handleCloseToc,
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
        <NavbarGroup align={Alignment.CENTER}>
          <SearchAutocomplete
            queryKey="sicpSearchData"
            fetchSearchData={fetchSicpSearchData}
            onNavigate={handleNavigation}
          />
        </NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps} className="sicp-toc-drawer">
        <SicpToc handleCloseToc={handleCloseToc} />
      </Drawer>
    </>
  );
}

export default SicpNavigationBar;
