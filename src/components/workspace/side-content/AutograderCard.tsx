import {
    // Button,
    // ButtonGroup,
    Card,
    // Classes,
    // Collapse,
    // Dialog,
    Elevation,
    // Icon,
    // IconName
    // Intent,
    // NonIdealState,
    // Position,
    // Spinner,
    // Text,
    // Tooltip
  } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { stringify } from 'js-slang/dist/interop';
import * as React from 'react';
// tslint:disable-next-line
import { controlButton } from '../../commons';
// tslint:disable-next-line
import { ITestcase } from '../../assessment/assessmentShape';
// tslint:disable-next-line
import CanvasOutput from '../CanvasOutput';
// tslint:disable-next-line
import Markdown from '../../commons/Markdown';

// import { InterpreterOutput } from '../../../reducers/states';




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

    return <div>
    <Card className="row listing" elevation={Elevation.ONE}>
      <div className="col-xs-9 listing-text">
        {/* {makeOverviewCardTitle(overview, index, setBetchaAssessment, renderGradingStatus)} */}
        <div className="row listing-program">
          <h6>
             <Markdown content={'Test Program ' + (this.props.index + 1) + ': `' + this.props.testcase.program + '`'} />
          </h6>
        </div>
        <div className="row listing-expected">
          <h6>
            <Markdown content={'Expected Answer: `' + this.props.testcase.answer + '`'} />
          </h6>
        </div>
        <div className="row listing-actual">
          <h6>
            {'Actual Answer: '} {this.props.testcase.actual !== undefined
              ? <pre>{renderResult(this.props.testcase.actual.value)}</pre>
              : "No Answer"}
          </h6>
        </div> 
        <div className="listing-controls">
          <div>
            {controlButton("Test", IconNames.PLAY, () => this.props.handleTestcaseEval(this.props.index)) }
          </div>
        </div>
      </div>
    </Card>
  </div>;
  }
}


export default AutograderCard;