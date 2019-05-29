import { Card, Elevation } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { stringify } from 'js-slang/dist/interop';
import * as React from 'react';
import { ITestcase } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import CanvasOutput from '../CanvasOutput';

type AutograderCardProps = {
  testcase: ITestcase;
  index: number;
  handleTestcaseEval: (testcaseId: number) => void;
};

class AutograderCard extends React.Component<AutograderCardProps, {}> {
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

    const isCorrect =
      this.props.testcase.actual !== undefined
        ? // tslint:disable-next-line
          this.props.testcase.actual.value == this.props.testcase.answer
          ? ' correct'
          : ' wrong'
        : '';

    return (
      <div className={'AutograderCard' + isCorrect}>
        <Card elevation={Elevation.ONE}>
          <div className="row autograder-controls">
            {'Testcase ' + (this.props.index + 1)}
            <div className="listing-controls">
              {controlButton('Test', IconNames.PLAY, () =>
                this.props.handleTestcaseEval(this.props.index)
              )}
            </div>
          </div>
          <div className="row autograder-program">
            Program: <pre className="code">{this.props.testcase.program}</pre>
          </div>
          <div className="row">
            <div className="col autograder-expected">
              Expected Answer:
              <pre className="code">{this.props.testcase.answer}</pre>
            </div>
            <div className="col autograder-actual">
              Actual Answer:
              {this.props.testcase.actual !== undefined ? (
                <pre className="code">{renderResult(this.props.testcase.actual.value)}</pre>
              ) : (
                <pre>No Answer</pre>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }
}

export default AutograderCard;
