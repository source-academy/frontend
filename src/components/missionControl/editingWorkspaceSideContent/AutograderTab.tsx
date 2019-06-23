import { Card, Elevation } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
// import { stringify } from 'js-slang/dist/interop';
import * as React from 'react';
import { IAssessment, IProgrammingQuestion, ITestcase } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
// import Markdown from '../../commons/Markdown';
// import CanvasOutput from '../../workspace/CanvasOutput';
import { testcaseTemplate } from '../assessmentTemplates';
import { getValueFromPath } from './';
import TextareaContent from './TextareaContent';

type AutograderProps = {
  assessment: IAssessment;
  questionId: number;
  handleTestcaseEval: (testcase: ITestcase) => void;
  updateAssessment: (assessment: IAssessment) => void;
};

class AutograderTab extends React.Component<AutograderProps, {}> {
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

  private addTestcase = (testcases: ITestcase[]) => () => {
    testcases.push(testcaseTemplate());
    this.props.updateAssessment(this.props.assessment);
  };

  private removeTestcase = (testcases: ITestcase[], id: number) => {
    testcases.splice(id, 1);
    this.props.updateAssessment(this.props.assessment);
  };

  private autograderCard = (testcasePath: Array<string | number>, index: number) => {
    // testcasePath = ["questions", questionId, "testcases"]
    const testcases = getValueFromPath(testcasePath, this.props.assessment) as ITestcase[];
    const testcase = testcases[index];
    // const renderResult = (value: any) => {
    //   /** A class which is the output of the show() function */
    //   const ShapeDrawn = (window as any).ShapeDrawn;
    //   if (typeof ShapeDrawn !== 'undefined' && value instanceof ShapeDrawn) {
    //     return <CanvasOutput />;
    //   } else {
    //     return stringify(value);
    //   }
    // };

    return (
      <div>
        <Card className="row listing" elevation={Elevation.ONE}>
          <div className="col-xs-9 listing-text">
            {/* {makeOverviewCardTitle(overview, index, setBetchaAssessment, renderGradingStatus)} */}
            <div className="row listing-program">
              <h6>
                Test Program:
                <TextareaContent
                  assessment={this.props.assessment}
                  path={testcasePath.concat([index, 'program'])}
                  useRawValue={true}
                  updateAssessment={this.props.updateAssessment}
                />
              </h6>
            </div>
            <div className="row listing-expected">
              <h6>
                Score:
                <TextareaContent
                  assessment={this.props.assessment}
                  isNumber={true}
                  path={testcasePath.concat([index, 'score'])}
                  updateAssessment={this.props.updateAssessment}
                />
              </h6>
            </div>
            <div className="row listing-expected">
              <h6>
                Expected Answer:
                <TextareaContent
                  assessment={this.props.assessment}
                  path={testcasePath.concat([index, 'answer'])}
                  useRawValue={true}
                  updateAssessment={this.props.updateAssessment}
                />
              </h6>
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

export default AutograderTab;
