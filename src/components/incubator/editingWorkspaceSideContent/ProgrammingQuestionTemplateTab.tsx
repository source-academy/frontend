import { Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import AceEditor from 'react-ace';

import { IAssessment } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import { assignToPath, getValueFromPath } from './';

interface IProps {
  assessment: IAssessment;
  editorValue: string | null;
  questionId: number;
  updateAssessment: (assessment: IAssessment) => void;
  handleEditorValueChange: (val: string) => void;
}

interface IState {
  templateValue: string;
  templateFocused: boolean;
  isSuggestedAnswer: boolean;
}

export class ProgrammingQuestionTemplateTab extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      templateValue: '',
      templateFocused: false,
      isSuggestedAnswer: false
    };
  }

  public render() {
    return this.programmingTab();
  }

  private programmingTab = () => {
    const qnPath = ['questions', this.props.questionId];
    const templateSwitch = (
      <Switch
        checked={this.state.isSuggestedAnswer}
        label="Edit suggested answers"
        onChange={this.toggleTemplateMode}
      />
    );
    const path = this.state.isSuggestedAnswer
      ? qnPath.concat(['solutionTemplate'])
      : qnPath.concat(['answer']);

    const copyFromEditorButton = controlButton(
      'Copy from Editor',
      IconNames.IMPORT,
      this.handleCopyFromEditor(path)
    );

    const copyToEditorButton = controlButton(
      'Copy to Editor',
      IconNames.EXPORT,
      this.handleCopyToEditor(path)
    );

    const handleTemplateChange = (newCode: string) => {
      this.setState({
        templateValue: newCode
      });
    };

    const value = this.state.templateFocused
      ? this.state.templateValue
      : getValueFromPath(path, this.props.assessment);

    const editor = (
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

    return (
      <div>
        {templateSwitch}
        <br />
        {copyFromEditorButton}
        {copyToEditorButton}
        <br />
        <br />
        {editor}
        }
      </div>
    );
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

  private toggleTemplateMode = () => {
    this.setState({
      isSuggestedAnswer: !this.state.isSuggestedAnswer
    });
  };

  private handleCopyFromEditor = (path: Array<string | number>) => (): void => {
    const assessment = this.props.assessment;
    assignToPath(path, this.props.editorValue, assessment);
    this.props.updateAssessment(assessment);
  };

  private handleCopyToEditor = (path: Array<string | number>) => (): void => {
    const value = getValueFromPath(path, this.props.assessment);
    this.props.handleEditorValueChange(value);
  };
}

export default ProgrammingQuestionTemplateTab;
