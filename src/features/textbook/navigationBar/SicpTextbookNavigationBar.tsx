import type { TreeNodeInfo } from '@blueprintjs/core';
import { Alignment, Drawer, Navbar, NavbarGroup, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ControlButton from 'src/commons/ControlButton';
import { TableOfContentsButton } from 'src/features/sicp/TableOfContentsButton';
import SicpToc from 'src/features/textbook/toc/SicpToc';

import SearchAutocomplete from './autocomplete/SearchAutocomplete';
import type { SearchData } from './autocomplete/types';

type Props = {
  /** Route prefix appended to the section slug, e.g. '/sicpjs'. No trailing slash. */
  routePrefix: string;
  /** Resolves the section slug that precedes `section`. */
  getPrev: (section: string) => string | undefined;
  /** Resolves the section slug that follows `section`. */
  getNext: (section: string) => string | undefined;
  /** React Query cache key passed through to SearchAutocomplete. */
  queryKey: string;
  /** Async fetcher for the textbook search-data JSON. */
  fetchSearchData: () => Promise<SearchData>;
  /** Pre-built TreeNodeInfo[] from the textbook's TOC JSON. */
  toc: TreeNodeInfo[];
  /** Current section when navigation is controlled by an embedding view. */
  section?: string;
  /** Overrides route navigation when the textbook is embedded. */
  onNavigate?: (section: string) => void;
  /** Keeps the navigation controls visible in a scrolling embedding view. */
  sticky?: boolean;
  /** Additional class applied to the table of contents. */
  tocClassName?: string;
};

function SicpTextbookNavigationBar({
  routePrefix,
  getPrev,
  getNext,
  queryKey,
  fetchSearchData,
  toc,
  section: controlledSection,
  onNavigate,
  sticky = false,
  tocClassName,
}: Props) {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const { section: routeSection } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const section = controlledSection ?? routeSection ?? '';
  const prev = getPrev(section);
  const next = getNext(section);

  const handleOpenToc = () => setIsTocOpen(true);
  const handleCloseToc = () => setIsTocOpen(false);
  const handleClickToc = (node: TreeNodeInfo) => {
    setIsTocOpen(false);
    handleNavigation(String(node.nodeData));
  };

  const handleNavigation = (sect: string) => {
    if (onNavigate) {
      onNavigate(sect);
    } else {
      navigate(`${routePrefix}/${sect}`);
    }
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
      <Navbar
        className={classNames('SicpNavigationBar secondary-navbar', sticky && 'sticky top-0')}
      >
        <NavbarGroup align={Alignment.START}>{tocButton}</NavbarGroup>
        <NavbarGroup align={Alignment.END}>{[prevButton, nextButton]}</NavbarGroup>
        <NavbarGroup align={Alignment.CENTER}>
          <SearchAutocomplete
            queryKey={queryKey}
            fetchSearchData={fetchSearchData}
            onNavigate={handleNavigation}
          />
        </NavbarGroup>
      </Navbar>
      <Drawer {...drawerProps} className="sicp-toc-drawer">
        <SicpToc handleClick={handleClickToc} toc={toc} className={tocClassName} />
      </Drawer>
    </>
  );
}

export default SicpTextbookNavigationBar;
