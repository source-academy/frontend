import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type DeleteCellProps = OwnProps;

type OwnProps = {
  rowIndex: number;
  deleteRowHandler: (index: number) => void;
};

const DeleteCell: React.FC<DeleteCellProps> = props => {
  const clickHandler = React.useCallback(() => {
    props.deleteRowHandler(props.rowIndex);
  }, [props]);

  return <Button icon={IconNames.CROSS} onClick={clickHandler} />;
};
export default DeleteCell;
