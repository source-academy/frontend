import { Card } from '@blueprintjs/core';
import * as React from 'react';
import AceEditor from 'react-ace';

import { IAssessment, IMCQQuestion } from '../../assessment/assessmentShape';
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
    const display =
      type === 'mcq'
        ? this.mcqTab()
        : this.programmingTab();

    return display;
  };

  private programmingTab = () => {
    const path = ['questions', this.props.questionId, 'answer'];

    const handleTemplateChange = (newCode: string) => {
      const assessmentVal = this.props.assessment;
      assignToPath(path, newCode, assessmentVal);
      this.props.updateAssessment(assessmentVal);
    };

    const display = <AceEditor
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
    />;

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
          </div>
        </Card>
      </div>
    );
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

const getValueFromPath = (path: Array<string | number>, obj: any): any => {
  for (const next of path) {
    obj = obj[next];
  }
  return obj;
};

const assignToPath: any = (path: Array<string | number>, value: any, obj: any): void => {
  let i = 0;
  for (i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
};

export default QuestionTemplateTab;