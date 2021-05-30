import { Drawer, Position } from '@blueprintjs/core';
import * as React from 'react';

import ControlBar from '../../../commons/controlBar/ControlBar';
import { ControlBarTableOfContentsButton } from '../../../commons/controlBar/ControlBarTableOfContentsButton';
import SicpToc from './SicpToc';

type ControlBarProps = OwnProps;

type OwnProps = {};

const SicpControlBar: React.FC<ControlBarProps> = props => {
  const [isTocOpen, setIsTocOpen] = React.useState(false);

  const handleCloseToc = () => setIsTocOpen(false);

  const menuButton = React.useMemo(() => {
    const handleOpenToc = () => setIsTocOpen(true);
    return <ControlBarTableOfContentsButton key="toc" handleOpenToc={handleOpenToc} />;
  }, []);

  const controlBarProps = {
    editorButtons: [menuButton],
    flowButtons: [],
    editingWorkspaceButtons: []
  };

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
      <ControlBar {...controlBarProps} />
      <Drawer {...drawerProps}>
        <SicpToc handleCloseToc={handleCloseToc} location="sidebar" />
      </Drawer>
    </>
  );
};

export default SicpControlBar;
