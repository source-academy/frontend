import { Card, Elevation, Pre } from '@blueprintjs/core';
import { parseError } from 'js-slang';
import { stringify } from 'js-slang/dist/interop';
import { SourceError } from 'js-slang/dist/types';
import * as React from 'react';
import { ITestcase } from '../../assessment/assessmentShape';
import CanvasOutput from '../CanvasOutput';

type AutograderCardProps = {
  testcase: ITestcase;
  index: number;
  handleTestcaseEval: (testcaseId: number) => void;
};

class AutograderCard extends React.Component<AutograderCardProps, {}> {
  public render() {
    let gradingStatus: string = '';

    const buildErrorString = (errors: SourceError[]) => {
      return parseError(errors);
    };

    const renderResult = (value: any) => {
      /** A class which is the output of the show() function */
      const ShapeDrawn = (window as any).ShapeDrawn;
      if (typeof ShapeDrawn !== 'undefined' && value instanceof ShapeDrawn) {
        return <CanvasOutput />;
      } else {
        return stringify(value);
      }
    };

    if (this.props.testcase.result || this.props.testcase.errors) {
      gradingStatus = ' wrong';

      if (stringify(this.props.testcase.result) === this.props.testcase.answer) {
        gradingStatus = ' correct';
      }
    }

    return (
      <div className={'AutograderCard' + gradingStatus}>
        <Card className="bp3-interactive" elevation={Elevation.ONE} onClick={this.evalSelf}>
          <Pre className="testcase-program">{this.props.testcase.program}</Pre>
          <Pre className="testcase-expected">{this.props.testcase.answer}</Pre>
          <Pre className="testcase-actual">
            {this.props.testcase.errors
              ? buildErrorString(this.props.testcase.errors)
              : this.props.testcase.result
              ? renderResult(this.props.testcase.result)
              : 'No Answer'}
          </Pre>
        </Card>
      </div>
    );
  }

  // Enable clicks on the card to run the testcase
  private evalSelf = () => {
    this.props.handleTestcaseEval(this.props.index);
  };
}

export default AutograderCard;
