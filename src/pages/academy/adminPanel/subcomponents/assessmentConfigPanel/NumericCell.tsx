import { NumericInput } from '@blueprintjs/core';
import { IRowNode } from 'ag-grid-community';
import React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

type Props = {
  data: AssessmentConfiguration;
  field: KeysOfType<AssessmentConfiguration, number>;
  node: IRowNode<AssessmentConfiguration>;
  setStateHandler: (index: number, value: number) => void;
};

const NumericCell: React.FC<Props> = props => {
  const { data } = props;
  const { rowIndex } = props.node;

  const changeHandler = React.useCallback(
    (value: number) => {
      props.setStateHandler(rowIndex!, value);
    },
    [props, rowIndex]
  );

  return (
    <NumericInput
      value={data[props.field]}
      min={0}
      clampValueOnBlur
      onValueChange={changeHandler}
    />
  );
};
export default NumericCell;
