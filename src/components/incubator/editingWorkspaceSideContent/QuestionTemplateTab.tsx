import { Card } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import AceEditor from 'react-ace';

import { IAssessment, IMCQQuestion } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import { assignToPath, getValueFromPath } from './';
import TextareaContent from './TextareaContent';

interface IProps {
  assessment: IAssessment;
  questionId: number;
  updateAssessment: (assessment: IAssessment) => void;
}

export class QuestionTemplateTab extends React.Component<IProps, {}> {
  public constructor(props: IProps) {
    super(props);
  }

  public render() {
    return this.questionTemplateTab();
  }

  private questionTemplateTab = () => {
    // tslint:disable-next-line:no-console
    // console.dir(this.props.assessment)
    const type = this.props.assessment!.questions[this.props.questionId].type;
    const display = type === 'mcq' ? this.mcqTab() : this.programmingTab();

    return display;
  };

  private programmingTab = () => {
    const path = ['questions', this.props.questionId, 'answer'];

    const handleTemplateChange = (newCode: string) => {
      const assessmentVal = this.props.assessment;
      assignToPath(path, newCode, assessmentVal);
      this.props.updateAssessment(assessmentVal);
    };

    const display = (
      <AceEditor
        className="react-ace"
        editorProps={{
          $blockScrolling: Infinity
        }}
        fontSize={14}
        highlightActiveLine={false}
        mode="javascript"
        onChange={handleTemplateChange}
        theme="cobalt"
        value={getValueFromPath(path, this.props.assessment)}
        width="100%"
      />
    );

    return display;
  };

  private mcqTab = () => {
    const questionId = this.props.questionId;
    const question = this.props.assessment!.questions[questionId] as IMCQQuestion;
    const mcqButton = question.choices.map((choice, i) => (
      <div key={i} className="mcq-option col-xs-12">
        Option {i}:
        {this.textareaContent(['questions', questionId, 'choices', i, 'content'])}
        <br />
        Hint:
        {this.textareaContent(['questions', questionId, 'choices', i, 'hint'])}
      </div>
    ));

    return (
      <div className="MCQChooser row">
        <Card className="mcq-content-parent col-xs-12 middle-xs">
          <div className="row mcq-options-parent between-xs">
            {mcqButton}
            Solution:
            {this.textareaContent(['questions', questionId, 'solution'], true, [0, 3])}
            {controlButton('Add Option', IconNames.CONFIRM, this.addOption)}
            {controlButton('Delete Option', IconNames.REMOVE, this.delOption)}
          </div>
        </Card>
      </div>
    );
  };

  private addOption = () => {
    const assessment = this.props.assessment;
    const questionId = this.props.questionId;
    const question = assessment!.questions[questionId] as IMCQQuestion;
    const choices = question.choices.concat([
      {
        content: 'A',
        hint: null
      }
    ]);
    question.choices = choices;
    assessment!.questions[questionId] = question;
    this.props.updateAssessment(assessment);
  };

  private delOption = () => {
    const assessment = this.props.assessment;
    const questionId = this.props.questionId;
    const question = assessment!.questions[questionId] as IMCQQuestion;
    const choices = question.choices.slice(0, question.choices.length - 1);
    question.choices = choices;
    assessment!.questions[questionId] = question;
    this.props.updateAssessment(assessment);
  };

  private textareaContent = (
    path: Array<string | number>,
    isNumber: boolean = false,
    numberRange: number[] = [0]
  ) => {
    return (
      <TextareaContent
        assessment={this.props.assessment}
        isNumber={isNumber}
        numberRange={numberRange}
        path={path}
        updateAssessment={this.props.updateAssessment}
      />
    );
  };
}

export default QuestionTemplateTab;
