import { Card, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

import { AutogradingError, AutogradingResult } from '../assessment/AssessmentTypes';

type SideContentResultCardProps = StateProps;

type StateProps = {
  index: number;
  result: AutogradingResult;
};

const buildErrorString = (errors: AutogradingError[]) =>
  errors
    .map(error =>
      error.errorType === 'timeout'
        ? 'Timeout: Submission exceeded time limit for this test case.'
        : `Line ${error.line}: Error: ${error.errorExplanation}`
    )
    .join('\n');

const SideContentResultCard: React.FunctionComponent<SideContentResultCardProps> = props => {
  const { index, result } = props;

  return (
    <div className={classNames('ResultCard', result.resultType === 'pass' ? 'correct' : 'wrong')}>
      <Card elevation={Elevation.ONE}>
        <div className="result-data">
          <div className="result-idx">{index + 1}</div>
          <div className="result-status">{result.resultType.toUpperCase()}</div>
        </div>
        <Pre className="result-expected">{result.expected!}</Pre>
        <Pre className="result-actual">
          {result.resultType === 'error' ? buildErrorString(result.errors!) : result.actual!}
        </Pre>
      </Card>
    </div>
  );
};

export default SideContentResultCard;
