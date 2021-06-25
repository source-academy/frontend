import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type DeleteRowCellProps = OwnProps;

type OwnProps = {
  rowIndex: number;
  deleteRowHandler: (index: number) => void;
};

const DeleteRowCell: React.FC<DeleteRowCellProps> = props => {
  const clickHandler = React.useCallback(() => {
    props.deleteRowHandler(props.rowIndex);
  }, [props]);

  return <Button icon={IconNames.CROSS} onClick={clickHandler} />;
};
export default DeleteRowCell;
