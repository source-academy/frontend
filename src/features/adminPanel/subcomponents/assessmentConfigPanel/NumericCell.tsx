import { NumericInput } from '@blueprintjs/core';
import type { IRowNode } from 'ag-grid-community';
import { useCallback } from 'react';
import type { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import type { KeysOfType } from 'src/commons/utils/TypeHelper';

type Props = {
  data: AssessmentConfiguration;
  field: KeysOfType<AssessmentConfiguration, number>;
  node: IRowNode<AssessmentConfiguration>;
  onChange: (
    row: AssessmentConfiguration,
    field: KeysOfType<AssessmentConfiguration, number>,
    value: number,
  ) => void;
};

function NumericCell({ data, field, node, onChange }: Props) {
  const changeHandler = useCallback(
    (value: number) => {
      onChange(data, field, value);
    },
    [onChange, data, field],
  );

  return (
    <NumericInput value={data[field]} min={0} clampValueOnBlur onValueChange={changeHandler} />
  );
}

export default NumericCell;
