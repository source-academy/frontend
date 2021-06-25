import { Switch } from '@blueprintjs/core';
import React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';

type IsGradedCellProps = OwnProps;

type OwnProps = {
  data: AssessmentConfiguration;
  rowIndex: number;
  setIsGraded: (index: number, value: boolean) => void;
};

const IsGradedCell: React.FC<IsGradedCellProps> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(() => {
    props.setIsGraded(props.rowIndex, !data.isGraded);
  }, [data, props]);

  return <Switch checked={data.isGraded} onChange={changeHandler} />;
};

export default IsGradedCell;
