import { Card, Elevation } from '@blueprintjs/core';
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
                <pre className="code">{this.props.result.expected!}</pre>
              </div>
              <div className="col autograder-actual">
                Actual Answer:
                <pre className="code">{this.props.result.actual!}</pre>
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
                <pre className="code">{'Timeout... Your code ran for too long'}</pre>
              </div>
            </div>
          );
        default:
          return (
            <div key={index} className="autograder-error">
              <div className="row">
                {' '}
                {'Line: '} <pre className="code">{error.errorLine}</pre>
              </div>
              <div className="row error-explanation">
                {'Error: '}
                <pre className="code">{'Line ' + error.line + ': ' + error.errorExplanation}</pre>
              </div>
            </div>
          );
      }
    };

    // tslint:disable-next-line
    const isCorrect = this.props.result.resultType == 'pass' ? ' correct' : ' wrong';

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
