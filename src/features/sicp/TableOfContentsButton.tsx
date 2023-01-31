import React from 'react';

import ControlButton from '../../commons/ControlButton';

type TableOfContentsButtonProps = {
  handleOpenToc: () => void;
};

export const TableOfContentsButton: React.FC<TableOfContentsButtonProps> = ({ handleOpenToc }) => {
  return <ControlButton label="Table of Contents" onClick={handleOpenToc} />;
};
