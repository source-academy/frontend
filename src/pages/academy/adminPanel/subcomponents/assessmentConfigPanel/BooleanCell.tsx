import { Switch } from '@blueprintjs/core';
import React from 'react';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

type BooleanCellProps = OwnProps;

interface dataProps {
  [key: string]: boolean;
}

type OwnProps = {
  data: dataProps;
  field: KeysOfType<dataProps, boolean>;
  rowIndex: number;
  setStateHandler: (index: number, value: boolean) => void;
};

const BooleanCell: React.FC<BooleanCellProps> = props => {
  const { data } = props;
  const checked = data[props.field];

  const changeHandler = React.useCallback(() => {
    props.setStateHandler(props.rowIndex, !checked);
  }, [props, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
};

export default BooleanCell;
