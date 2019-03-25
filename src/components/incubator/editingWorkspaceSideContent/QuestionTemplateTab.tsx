import { Card } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import AceEditor from 'react-ace';

import { IAssessment, IMCQQuestion } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import { assignToPath, getValueFromPath, limitNumberRange } from './';
import TextareaContent from './TextareaContent';

interface IProps {
  assessment: IAssessment;
  questionId: number;
  updateAssessment: (assessment: IAssessment) => void;
}

interface IState {
  templateValue: string;
  templateFocused: boolean;
}

export class QuestionTemplateTab extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      templateValue: '',
      templateFocused: false
    };
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
      this.setState({
        templateValue: newCode
      });
    };

    const value = this.state.templateFocused
      ? this.state.templateValue
      : getValueFromPath(path, this.props.assessment);

    const display = (
      <div onClick={this.focusEditor(path)} onBlur={this.unFocusEditor(path)}>
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
          value={value}
          width="100%"
        />
      </div>
    );

    return display;
  };

  private focusEditor = (path: Array<string | number>) => (e: any): void => {
    if (!this.state.templateFocused) {
      this.setState({
        templateValue: getValueFromPath(path, this.props.assessment),
        templateFocused: true
      });
    }
  };

  private unFocusEditor = (path: Array<string | number>) => (e: any): void => {
    if (this.state.templateFocused) {
      const value = getValueFromPath(path, this.props.assessment);
      if (value !== this.state.templateValue) {
        const assessmentVal = this.props.assessment;
        assignToPath(path, this.state.templateValue, assessmentVal);
        this.props.updateAssessment(assessmentVal);
      }
      this.setState({
        templateValue: '',
        templateFocused: false
      });
    }
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
    const deleteButton = controlButton('Delete Option', IconNames.REMOVE, this.delOption);
    
    return (
      <div className="MCQChooser row">
        <Card className="mcq-content-parent col-xs-12 middle-xs">
          <div className="row mcq-options-parent between-xs">
            {mcqButton}
            Solution:
            {this.textareaContent(['questions', questionId, 'solution'], true, [0, question.choices.length])}
            <br/>
            {controlButton('Add Option', IconNames.CONFIRM, this.addOption)}
            {(question.choices.length > 0) ? deleteButton : undefined}
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
    range: number[] = [0]
  ) => {
    if (isNumber) {
      return (
        <TextareaContent
          assessment={this.props.assessment}
          isNumber={true}
          path={path}
          processResults={limitNumberRange(range[0], range[1])}
          updateAssessment={this.props.updateAssessment}
        />
      );
    } else {
      return (
        <TextareaContent
          assessment={this.props.assessment}
          path={path}
          updateAssessment={this.props.updateAssessment}
        />
      );
    }
  };
}

export default QuestionTemplateTab;
