import { NumericInput } from '@blueprintjs/core';
import React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

type Props = {
  data: AssessmentConfiguration;
  field: KeysOfType<AssessmentConfiguration, number>;
  rowIndex: number;
  setStateHandler: (index: number, value: number) => void;
};

const NumericCell: React.FC<Props> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(
    (value: number) => {
      props.setStateHandler(props.rowIndex, value);
    },
    [props]
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
