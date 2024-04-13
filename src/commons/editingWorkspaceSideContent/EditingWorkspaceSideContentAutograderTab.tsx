import { Card, Elevation, H6 } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import {
  Assessment,
  IProgrammingQuestion,
  Testcase,
  testcaseTemplate
} from '../assessment/AssessmentTypes';
import ControlButton from '../ControlButton';
import { getValueFromPath } from './EditingWorkspaceSideContentHelper';
import TextAreaContent from './EditingWorkspaceSideContentTextAreaContent';

type AutograderProps = DispatchProps & StateProps;

type DispatchProps = {
  handleTestcaseEval: (testcase: Testcase) => void;
  updateAssessment: (assessment: Assessment) => void;
};

type StateProps = {
  assessment: Assessment;
  questionId: number;
};

export const AutograderTab: React.FC<AutograderProps> = props => {
  const addTestcase = (testcases: Testcase[]) => () => {
    testcases.push(testcaseTemplate());
    props.updateAssessment(props.assessment);
  };

  const removeTestcase = (testcases: Testcase[], id: number) => {
    testcases.splice(id, 1);
    props.updateAssessment(props.assessment);
  };

  const autograderCard = (testcasePath: Array<string | number>, index: number) => {
    const testcases = getValueFromPath(testcasePath, props.assessment) as Testcase[];
    const testcase = testcases[index];

    return (
      <div>
        <Card className="row listing" elevation={Elevation.ONE}>
          <div className="col-xs-9 listing-text">
            <div className="row listing-program">
              <H6>
                Test Program:
                <TextAreaContent
                  assessment={props.assessment}
                  path={testcasePath.concat([index, 'program'])}
                  useRawValue={true}
                  updateAssessment={props.updateAssessment}
                />
              </H6>
            </div>
            <div className="row listing-expected">
              <H6>
                Score:
                <TextAreaContent
                  assessment={props.assessment}
                  isNumber={true}
                  path={testcasePath.concat([index, 'score'])}
                  updateAssessment={props.updateAssessment}
                />
              </H6>
            </div>
            <div className="row listing-expected">
              <H6>
                Expected Answer:
                <TextAreaContent
                  assessment={props.assessment}
                  path={testcasePath.concat([index, 'answer'])}
                  useRawValue={true}
                  updateAssessment={props.updateAssessment}
                />
              </H6>
            </div>
            <div className="listing-controls">
              <div>
                <ControlButton
                  label="Test"
                  icon={IconNames.PLAY}
                  onClick={() => props.handleTestcaseEval(testcase)}
                />
                <ControlButton
                  label="Delete"
                  icon={IconNames.DELETE}
                  onClick={() => removeTestcase(testcases, index)}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const question = props.assessment.questions[props.questionId] as IProgrammingQuestion;
  const publicTestPath = ['questions', props.questionId, 'testcases'];

  const publicTestcases = question.testcases.map((testcase, index) => (
    <div key={index}>{autograderCard(publicTestPath, index)}</div>
  ));

  const privateTestPath = ['questions', props.questionId, 'testcasesPrivate'];
  const privateTestcases = question.testcasesPrivate!.map((testcase, index) => (
    <div key={index}>{autograderCard(privateTestPath, index)}</div>
  ));

  return (
    <div>
      Public Testcases
      {publicTestcases}
      <ControlButton
        label="New public testcase"
        icon={IconNames.PLUS}
        onClick={addTestcase(question.testcases)}
      />
      <br />
      <br />
      Private Testcases
      {privateTestcases}
      <ControlButton
        label="New private testcase"
        icon={IconNames.PLUS}
        onClick={addTestcase(question.testcasesPrivate!)}
      />
    </div>
  );
};
