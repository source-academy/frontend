import { Switch } from '@blueprintjs/core';
import React from 'react';

import { AssessmentConfiguration } from '../../../../../commons/assessment/AssessmentTypes';

type BooleanCellProps = OwnProps;

type OwnProps = {
  data: AssessmentConfiguration;
  field: AssessmentConfigBooleanField;
  rowIndex: number;
  setStateHandler: (index: number, value: boolean) => void;
};

export enum AssessmentConfigBooleanField {
  IS_GRADED = 'IS_GRADED',
  SKIPPABLE = 'SKIPPABLE',
  IS_AUTOGRADED = 'IS_AUTOGRADED'
}

const BooleanCell: React.FC<BooleanCellProps> = props => {
  const { data } = props;

  const checked =
    props.field === AssessmentConfigBooleanField.IS_GRADED
      ? data.isGraded
      : props.field === AssessmentConfigBooleanField.SKIPPABLE
      ? data.skippable
      : data.isAutograded;

  const changeHandler = React.useCallback(() => {
    props.setStateHandler(props.rowIndex, !checked);
  }, [props, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
};

export default BooleanCell;
