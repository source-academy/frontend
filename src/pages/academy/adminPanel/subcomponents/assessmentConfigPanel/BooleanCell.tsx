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
  BUILD_HIDDEN = 'BUILD_HIDDEN',
  BUILD_SOLUTION = 'BUILD_SOLUTION',
  IS_CONTEST = 'IS_CONTEST'
}

const BooleanCell: React.FC<BooleanCellProps> = props => {
  const { data } = props;

  const checked =
    props.field === AssessmentConfigBooleanField.BUILD_HIDDEN
      ? data.buildHidden
      : props.field === AssessmentConfigBooleanField.BUILD_SOLUTION
      ? data.buildSolution
      : data.isContest;

  const changeHandler = React.useCallback(() => {
    props.setStateHandler(props.rowIndex, !checked);
  }, [props, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
};

export default BooleanCell;
