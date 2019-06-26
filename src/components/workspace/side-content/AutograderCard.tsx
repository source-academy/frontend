import { Card, Elevation } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { stringify } from 'js-slang/dist/interop';
import * as React from 'react';
import { ITestcase } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';

type AutograderCardProps = {
  testcase: ITestcase;
  index: number;
  handleTestcaseEval: (testcaseId: number) => void;
};

class AutograderCard extends React.Component<AutograderCardProps, {}> {
  public render() {
    let gradingStatus: string = '';

    if (this.props.testcase.result) {
      gradingStatus =
        stringify(this.props.testcase.result) === this.props.testcase.answer
          ? ' correct'
          : ' wrong';
    }

    return (
      <div className={'AutograderCard' + gradingStatus}>
        <Card elevation={Elevation.ONE}>
          <div className="row autograder-controls">
            {'Testcase ' + (this.props.index + 1)}
            {controlButton('Test', IconNames.PLAY, () =>
              this.props.handleTestcaseEval(this.props.index)
            )}
          </div>
          <div className="row autograder-program">
            <pre className="code">{this.props.testcase.program}</pre>
          </div>
          <div className="row">
            <div className="col autograder-expected">
              Expected Answer:
              <pre className="code">{this.props.testcase.answer}</pre>
            </div>
            <div className="col autograder-actual">
              Actual Answer:
              {this.props.testcase.result ? (
                <pre className="code">{stringify(this.props.testcase.result)}</pre>
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
