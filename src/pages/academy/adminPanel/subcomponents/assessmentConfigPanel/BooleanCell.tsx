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
  IS_MANUALLY_GRADED = 'IS_MANUALLY_GRADED',
  DISPLAY_IN_DASHBOARD = 'DISPLAY_IN_DASHBOARD'
}

const BooleanCell: React.FC<BooleanCellProps> = props => {
  const { data } = props;

  const checked =
    props.field === AssessmentConfigBooleanField.IS_MANUALLY_GRADED
      ? data.isManuallyGraded
      : data.displayInDashboard;

  const changeHandler = React.useCallback(() => {
    props.setStateHandler(props.rowIndex, !checked);
  }, [props, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
};

export default BooleanCell;
