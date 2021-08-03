import { Switch } from '@blueprintjs/core';
import React from 'react';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

import { AssessmentConfiguration } from '../../../../../commons/assessment/AssessmentTypes';

type BooleanCellProps = OwnProps;

type OwnProps = {
  data: AssessmentConfiguration;
  field: KeysOfType<AssessmentConfiguration, boolean>;
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
