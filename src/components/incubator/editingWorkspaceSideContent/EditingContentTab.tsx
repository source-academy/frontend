import { Card } from '@blueprintjs/core';
import * as React from 'react';
import AceEditor from 'react-ace';

import { IAssessment, IMCQQuestion } from '../../assessment/assessmentShape';
import { mcqTemplate, programmingTemplate } from '../../incubator/assessmentTemplates';
import TextareaContent from './TextareaContent';

interface IProps {
  assessment: IAssessment;
  path: Array<string | number>;
  type: string;
  updateAssessment: (assessment: IAssessment) => void;
}

interface IState {
  editingAssessmentPath: string;
  fieldValue: string;
}

export class EditingContentTab extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      editingAssessmentPath: '',
      fieldValue: ''
    };
  }

  public render() {
    switch (this.props.type) {
      case "questionTemplate":
        return this.questionTemplateTab();
      case "grading":
        return this.gradingTab();
      case "manageQuestions":
        return this.manageQuestionTab();      
      default:
        return null;
    }
  }

  private manageQuestionTab = () => {
    return (
      <div>
        <button onClick={this.makeProgramming}>Make Programming Question</button>
        <button onClick={this.makeMCQ}>Make MCQ Question</button>
        <button onClick={this.deleteQn}>Delete Question</button>
      </div>
    );
  };

  private makeProgramming = () => {
    const assessment = this.props.assessment;
    const path = [this.props.path[0]];
    const index = (path[1] as number) + 1;
    let questions = getValueFromPath(path, assessment);
    questions = questions
      .slice(0, index)
      .concat([programmingTemplate])
      .concat(questions.slice(index));
    assignToPath(path, questions, assessment);
    this.props.updateAssessment(assessment);
  };

  private makeMCQ = () => {
    const assessment = this.props.assessment;
    const path = [this.props.path[0]];
    const index = (path[1] as number) + 1;
    let questions = getValueFromPath(path, assessment);
    questions = questions
      .slice(0, index)
      .concat([mcqTemplate])
      .concat(questions.slice(index));
    assignToPath(path, questions, assessment);
    this.props.updateAssessment(assessment);
  };

  private deleteQn = () => {
    const assessment = this.props.assessment;
    const path = this.props.path;
    let questions = getValueFromPath([path[0]], assessment);
    const index = path[1] as number;
    if (questions.length > 1) {
      questions = questions.slice(0, index).concat(questions.slice(index + 1));
    }
    assignToPath([path[0]], questions, assessment);
    this.props.updateAssessment(assessment);
  };

  private handleTemplateChange = (path: Array<string | number>) => (newCode: string) => {
    const assessmentVal = this.props.assessment;
    assignToPath(path, newCode, assessmentVal);
    this.setState({
      editingAssessmentPath: '',
      fieldValue: ''
    });
    this.props.updateAssessment(assessmentVal);
  };

  private mcqTab = (questionId: number) => {
    const question = this.props.assessment!.questions[questionId] as IMCQQuestion;
    const mcqButton = question.choices.map((choice, i) => (
      <div key={i} className="mcq-option col-xs-12">
        Option {i}:
        {this.textareaContent(['questions', questionId, 'choices', i, 'content'], 'Enter Option here')}
        <br />
        Hint:
        {this.textareaContent(['questions', questionId, 'choices', i, 'hint'], 'Enter Hint here')}
      </div>
    ));

    return (
      <div className="MCQChooser row">
        <Card className="mcq-content-parent col-xs-12 middle-xs">
          <div className="row mcq-options-parent between-xs">
            {mcqButton}
            Solution:
            {this.textareaContent(['questions', questionId, 'solution'], 'Enter Solution Here', false)}
          </div>
        </Card>
      </div>
    );
  };

  private programmingTab = (path: Array<string | number>) => (
    <AceEditor
      className="react-ace"
      editorProps={{
        $blockScrolling: Infinity
      }}
      fontSize={14}
      highlightActiveLine={false}
      mode="javascript"
      onChange={this.handleTemplateChange(path)}
      theme="cobalt"
      value={getValueFromPath(path, this.props.assessment)}
    />
  );

  private questionTemplateTab = () => {
    const questionId = this.props.path[1] as number;
    // tslint:disable-next-line:no-console
    // console.dir(this.props.assessment)
    const type = this.props.assessment!.questions[questionId].type;
    const display =
      type === 'mcq'
        ? this.mcqTab(questionId)
        : this.programmingTab(this.props.path.concat(['answer']));

    return display;
  };

  private textareaContent = (
    path: Array<string | number>,
    filler: string = 'Enter Value',
    isNumber: boolean = false
  ) => {
    return (
      <TextareaContent
        assessment={this.props.assessment}
        filler={filler}
        isNumber={isNumber}
        path={path}
        updateAssessment={this.props.updateAssessment}
      />
    );
  };

  private gradingTab = () => (
    <div>
      Max Grade:
      {this.textareaContent(this.props.path.concat(['maxGrade']), '0', true)}
      <br />
      Max Xp:
      {this.textareaContent(this.props.path.concat(['maxXp']), '0', true)}
    </div>
  );
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

export default EditingContentTab;
