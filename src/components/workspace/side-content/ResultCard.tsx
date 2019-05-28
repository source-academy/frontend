import { Card, Elevation } from '@blueprintjs/core';
import { stringify } from 'js-slang/dist/interop';
import * as React from 'react';
// tslint:disable-next-line
import { AutogradingError, AutogradingResult } from '../../assessment/assessmentShape';
// tslint:disable-next-line
import CanvasOutput from '../CanvasOutput';
// tslint:disable-next-line
import Markdown from '../../commons/Markdown';

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

    const showFail = () => (
      <div>
        <div className="row listing-expected">
          <h6>
            <Markdown content={'Expected Answer: `' + this.props.result.expected! + '`'} />
          </h6>
        </div>
        <div className="row listing-actual">
          <h6>
            {'Actual Answer: '} <pre>{renderResult(this.props.result.actual!)}</pre>
          </h6>
        </div>
      </div>
    );

    const showPass = () => <div> Pass </div>;

    const showErrors = () => (
      <div>
        <h6>
          <p>{this.props.result.errors!.map(showError)}</p>
        </h6>
      </div>
    );

    const showError = (error: AutogradingError) => (
      <div>
        <h6>
          {'Error on line '}
          {error.errorLine}
          {'Line: '}
          {error.line}
          {'Error: '}
          {error.errorExplanation}
        </h6>
      </div>
    );

    return (
      <div>
        <Card className="row listing" elevation={Elevation.ONE}>
          <div className="col-xs-9 listing-text">
            <p>Testcase {this.props.index + 1}</p>
            {this.props.result.resultType === 'pass'
              ? showPass()
              : this.props.result.resultType === ' fail'
                ? showFail()
                : showErrors()}
          </div>
        </Card>
      </div>
    );
  }
}

export default ResultCard;
