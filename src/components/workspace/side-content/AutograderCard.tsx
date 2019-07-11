import { Card, Elevation, Pre } from '@blueprintjs/core';
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
      gradingStatus = ' wrong';

      if (stringify(this.props.testcase.result) === this.props.testcase.answer) {
        gradingStatus = ' correct';
      }
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
            <Pre>{this.props.testcase.program}</Pre>
          </div>
          <div className="row">
            <div className="col autograder-expected">
              Expected Answer:
              <Pre>{this.props.testcase.answer}</Pre>
            </div>
            <div className="col autograder-actual">
              Actual Answer:
              {this.props.testcase.result ? (
                <Pre>{stringify(this.props.testcase.result)}</Pre>
              ) : (
                <Pre>No Answer</Pre>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }
}

export default AutograderCard;
