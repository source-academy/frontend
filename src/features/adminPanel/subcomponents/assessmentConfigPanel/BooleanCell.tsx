import { Switch } from '@blueprintjs/core';
import type { IRowNode } from 'ag-grid-community';
import { useCallback } from 'react';
import type { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import type { KeysOfType } from 'src/commons/utils/TypeHelper';

type Props = {
  data: AssessmentConfiguration;
  field: KeysOfType<AssessmentConfiguration, boolean>;
  node: IRowNode<AssessmentConfiguration>;
  setStateHandler: (index: number, value: boolean) => void;
};

function BooleanCell(props: Props) {
  const { data } = props;
  const { rowIndex } = props.node;
  const checked = data[props.field];

  const changeHandler = useCallback(() => {
    props.setStateHandler(rowIndex!, !checked);
  }, [props, rowIndex, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
}

export default BooleanCell;
