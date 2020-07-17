import { Card, Classes, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import { parseError } from 'js-slang';
import { stringify } from 'js-slang/dist/utils/stringify';
import * as React from 'react';

import { Testcase, TestcaseTypes } from '../assessment/AssessmentTypes';
import SideContentCanvasOutput from './SideContentCanvasOutput';

type SideContentAutograderCardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleTestcaseEval: (testcaseId: number) => void;
};

type StateProps = {
  testcase: Testcase;
  index: number;
};

const renderResult = (value: any) => {
  /** A class which is the output of the show() function */
  const ShapeDrawn = (window as any).ShapeDrawn;
  if (typeof ShapeDrawn !== 'undefined' && value instanceof ShapeDrawn) {
    return <SideContentCanvasOutput canvas={value.$canvas} />;
  } else {
    return stringify(value);
  }
};

class SideContentAutograderCard extends React.Component<SideContentAutograderCardProps, {}> {
  public render() {
    const isEvaluated = this.props.testcase.result !== undefined || this.props.testcase.errors;
    const isEqual = stringify(this.props.testcase.result) === this.props.testcase.answer;

    const extraClasses = {
      correct: isEvaluated && isEqual,
      wrong: isEvaluated && !isEqual,
      private: this.props.testcase.type === TestcaseTypes.private
    };

    // Render a placeholder cell in place of the actual testcase data for hidden testcases
    if (this.props.testcase.type === TestcaseTypes.hidden) {
      return (
        <div className={classNames('AutograderCard', extraClasses)}>
          <Card className="bp3-interactive" elevation={Elevation.ONE} onClick={this.evalSelf}>
            <Pre className="testcase-placeholder">Hidden testcase</Pre>
          </Card>
        </div>
      );
    }

    return (
      <div className={classNames('AutograderCard', extraClasses)}>
        <Card className={Classes.INTERACTIVE} elevation={Elevation.ONE} onClick={this.evalSelf}>
          <Pre className="testcase-program">{this.props.testcase.program}</Pre>
          <Pre className="testcase-expected">{this.props.testcase.answer}</Pre>
          <Pre className="testcase-actual">
            {this.props.testcase.errors
              ? parseError(this.props.testcase.errors)
              : this.props.testcase.result !== undefined
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

export default SideContentAutograderCard;
