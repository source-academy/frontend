import { Card, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

import { AutogradingError, AutogradingResult } from '../../assessment/AssessmentTypes';

const buildErrorString = (errors: AutogradingError[]) =>
  errors
    .map(error => {
      switch (error.errorType) {
        case 'timeout':
          return '[TIMEOUT] Submission exceeded time limit for this test case.';
        case 'syntax':
          return `[SYNTAX] Line ${error.line}: ${error.errorExplanation}`;
        case 'runtime':
          return `[RUNTIME] Line ${error.line}: ${error.errorExplanation}`;
        case 'systemError':
          return `[SYSTEM] ${error.errorMessage}`;
        default:
          return `[UNKNOWN] Autograder error: type ${error.errorType}`;
      }
    })
    .join('\n\n');

type Props = {
  index: number;
  result: AutogradingResult;
};

const SideContentResultCard: React.FC<Props> = ({ index, result }) => {
  return (
    <div
      className={classNames('ResultCard', result.resultType === 'pass' ? 'correct' : 'wrong')}
      data-testid="ResultCard"
    >
      <Card elevation={Elevation.ONE}>
        <div className="result-data">
          <div className="result-idx" data-testid="result-idx">
            {index + 1}
          </div>
          <div className="result-status" data-testid="result-status">
            {result.resultType.toUpperCase()}
          </div>
        </div>
        <Pre className="result-expected" data-testid="result-expected">
          {result.expected!}
        </Pre>
        <Pre className="result-actual" data-testid="result-actual">
          {result.resultType === 'error' ? buildErrorString(result.errors!) : result.actual!}
        </Pre>
      </Card>
    </div>
  );
};

export default SideContentResultCard;
