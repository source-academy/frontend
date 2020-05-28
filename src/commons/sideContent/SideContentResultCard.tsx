import { Card, Elevation, Pre } from '@blueprintjs/core';
import * as React from 'react';

import { AutogradingError, AutogradingResult } from '../assessment/AssessmentTypes';

type ResultCardProps = StateProps;

type StateProps = {
  index: number;
  result: AutogradingResult;
};

class ResultCard extends React.Component<ResultCardProps, {}> {
  public render() {
    const buildErrorString = (errors: AutogradingError[]) => {
      return errors
        .map(error =>
          error.errorType === 'timeout'
            ? 'Timeout: Submission exceeded time limit for this test case.'
            : `Line ${error.line}: Error: ${error.errorExplanation}`
        )
        .join('\n');
    };

    const isCorrect = this.props.result.resultType === 'pass' ? ' correct' : ' wrong';

    return (
      <div className={'ResultCard' + isCorrect}>
        <Card elevation={Elevation.ONE}>
          <div className="result-data">
            <div className="result-idx">{this.props.index + 1}</div>
            <div className="result-status">{this.props.result.resultType.toUpperCase()}</div>
          </div>
          <Pre className="result-expected">{this.props.result.expected!}</Pre>
          <Pre className="result-actual">
            {this.props.result.resultType === 'error'
              ? buildErrorString(this.props.result.errors!)
              : this.props.result.actual!}
          </Pre>
        </Card>
      </div>
    );
  }
}

export default ResultCard;
