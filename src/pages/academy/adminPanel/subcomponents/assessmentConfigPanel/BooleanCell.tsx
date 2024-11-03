import { Switch } from '@blueprintjs/core';
import { IRowNode } from 'ag-grid-community';
import React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

type Props = {
  data: AssessmentConfiguration;
  field: KeysOfType<AssessmentConfiguration, boolean>;
  node: IRowNode<AssessmentConfiguration>;
  setStateHandler: (index: number, value: boolean) => void;
};

const BooleanCell: React.FC<Props> = props => {
  const { data } = props;
  const { rowIndex } = props.node;
  const checked = data[props.field];

  const changeHandler = React.useCallback(() => {
    props.setStateHandler(rowIndex!, !checked);
  }, [props, rowIndex, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
};

export default BooleanCell;
