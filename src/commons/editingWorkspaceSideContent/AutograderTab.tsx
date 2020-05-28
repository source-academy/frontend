import { Card, Elevation, H6 } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import {
  Assessment,
  IProgrammingQuestion,
  Testcase,
  testcaseTemplate
} from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';

import { getValueFromPath } from './EditingWorkspaceSideContentHelper';
import TextAreaContent from './TextAreaContent';

type AutograderProps = DispatchProps & StateProps;

type DispatchProps = {
  handleTestcaseEval: (testcase: Testcase) => void;
  updateAssessment: (assessment: Assessment) => void;
};

type StateProps = {
  assessment: Assessment;
  questionId: number;
};

export class AutograderTab extends React.Component<AutograderProps, {}> {
  public render() {
    const question = this.props.assessment.questions[this.props.questionId] as IProgrammingQuestion;
    const publicTestPath = ['questions', this.props.questionId, 'testcases'];

    const publicTestcases = question.testcases.map((testcase, index) => (
      <div key={index}>{this.autograderCard(publicTestPath, index)}</div>
    ));

    const privateTestPath = ['questions', this.props.questionId, 'testcasesPrivate'];
    const privateTestcases = question.testcasesPrivate!.map((testcase, index) => (
      <div key={index}>{this.autograderCard(privateTestPath, index)}</div>
    ));

    return (
      <div>
        Public Testcases
        {publicTestcases}
        {controlButton('New public testcase', IconNames.PLUS, this.addTestcase(question.testcases))}
        <br />
        <br />
        Private Testcases
        {privateTestcases}
        {controlButton(
          'New private testcase',
          IconNames.PLUS,
          this.addTestcase(question.testcasesPrivate!)
        )}
      </div>
    );
  }

  private addTestcase = (testcases: Testcase[]) => () => {
    testcases.push(testcaseTemplate());
    this.props.updateAssessment(this.props.assessment);
  };

  private removeTestcase = (testcases: Testcase[], id: number) => {
    testcases.splice(id, 1);
    this.props.updateAssessment(this.props.assessment);
  };

  private autograderCard = (testcasePath: Array<string | number>, index: number) => {
    const testcases = getValueFromPath(testcasePath, this.props.assessment) as Testcase[];
    const testcase = testcases[index];

    return (
      <div>
        <Card className="row listing" elevation={Elevation.ONE}>
          <div className="col-xs-9 listing-text">
            {/* {makeOverviewCardTitle(overview, index, setBetchaAssessment, renderGradingStatus)} */}
            <div className="row listing-program">
              <H6>
                Test Program:
                <TextAreaContent
                  assessment={this.props.assessment}
                  path={testcasePath.concat([index, 'program'])}
                  useRawValue={true}
                  updateAssessment={this.props.updateAssessment}
                />
              </H6>
            </div>
            <div className="row listing-expected">
              <H6>
                Score:
                <TextAreaContent
                  assessment={this.props.assessment}
                  isNumber={true}
                  path={testcasePath.concat([index, 'score'])}
                  updateAssessment={this.props.updateAssessment}
                />
              </H6>
            </div>
            <div className="row listing-expected">
              <H6>
                Expected Answer:
                <TextAreaContent
                  assessment={this.props.assessment}
                  path={testcasePath.concat([index, 'answer'])}
                  useRawValue={true}
                  updateAssessment={this.props.updateAssessment}
                />
              </H6>
            </div>
            <div className="listing-controls">
              <div>
                {controlButton('Test', IconNames.PLAY, () =>
                  this.props.handleTestcaseEval(testcase)
                )}
                {controlButton('Delete', IconNames.DELETE, () =>
                  this.removeTestcase(testcases, index)
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };
}
