import { Card, Elevation, Pre } from '@blueprintjs/core';
import * as React from 'react';
import { AutogradingError, AutogradingResult } from '../../assessment/assessmentShape';

type ResultCardProps = {
  index: number;
  result: AutogradingResult;
};

class ResultCard extends React.Component<ResultCardProps, {}> {
  public render() {
    const showResult = (result: string) => {
      switch (result) {
        case 'pass':
          return <></>;
        case 'fail':
          return (
            <div className="row autograder-program">
              <div className="col autograder-expected">
                Expected Answer:
                <Pre>{this.props.result.expected!}</Pre>
              </div>
              <div className="col autograder-actual">
                Actual Answer:
                <Pre>{this.props.result.actual!}</Pre>
              </div>
            </div>
          );
        case 'error':
          return (
            <div className="row autograder-errors">{this.props.result.errors!.map(showError)}</div>
          );
        default:
          return null;
      }
    };

    const showStatus = (result: string) => {
      return <div className="status">{result}</div>;
    };

    const showError = (error: AutogradingError, index: number) => {
      switch (error.errorType) {
        case 'timeout':
          return (
            <div key={index} className="autograder-error">
              <div className="row error-explanation">
                {'Error: '}
                <Pre>{'Timeout... Your code ran for too long'}</Pre>
              </div>
            </div>
          );
        default:
          return (
            <div key={index} className="autograder-error">
              <div className="row">
                {' '}
                {'Line: '} <Pre>{error.errorLine}</Pre>
              </div>
              <div className="row error-explanation">
                {'Error: '}
                <Pre>{'Line ' + error.line + ': ' + error.errorExplanation}</Pre>
              </div>
            </div>
          );
      }
    };

    const isCorrect = this.props.result.resultType === 'pass' ? ' correct' : ' wrong';

    return (
      <div className={'ResultCard' + isCorrect}>
        <Card elevation={Elevation.ONE}>
          <div className="row">
            Testcase {this.props.index + 1}
            {showStatus(this.props.result.resultType)}
          </div>
          {showResult(this.props.result.resultType)}
        </Card>
      </div>
    );
  }
}

export default ResultCard;
