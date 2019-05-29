import { Card, Elevation } from '@blueprintjs/core';
import { stringify } from 'js-slang/dist/interop';
import * as React from 'react';
import { AutogradingError, AutogradingResult } from '../../assessment/assessmentShape';
import CanvasOutput from '../CanvasOutput';

type ResultCardProps = {
  index: number;
  result: AutogradingResult;
};

class ResultCard extends React.Component<ResultCardProps, {}> {
  public render() {
    const renderResult = (value: any) => {
      /** A class which is the output of the show() function */
      const ShapeDrawn = (window as any).ShapeDrawn;
      if (typeof ShapeDrawn !== 'undefined' && value instanceof ShapeDrawn) {
        return <CanvasOutput />;
      } else {
        return stringify(value);
      }
    };

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
                <pre className="code">{renderResult(this.props.result.actual!)}</pre>
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

    /* TODO: IMPROVE CSS */
    const showError = (error: AutogradingError) => (
      <div className="autograder-error">
        {'Error on line '} {error.errorLine}
        {'Line: '} {error.line}
        {'Error: '} {error.errorExplanation}
      </div>
    );

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
