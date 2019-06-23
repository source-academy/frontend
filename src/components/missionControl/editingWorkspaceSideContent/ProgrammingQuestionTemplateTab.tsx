// import { Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import AceEditor from 'react-ace';

import { IWorkspaceState } from '../../../reducers/states';
import { IAssessment } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import SideContent from '../../workspace/side-content';
import { assignToPath, getValueFromPath } from './';

interface IProps {
  assessment: IAssessment;
  editorValue: string | null;
  questionId: number;
  updateAssessment: (assessment: IAssessment) => void;
  handleEditorValueChange: (val: string) => void;
  handleUpdateWorkspace: (options: Partial<IWorkspaceState>) => void;
}

interface IState {
  activeTab: number;
  templateValue: string;
  templateFocused: boolean;
}

const tabPaths = ['prepend', 'postpend', 'solutionTemplate', 'answer'];

export class ProgrammingQuestionTemplateTab extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      activeTab: 0,
      templateValue: '',
      templateFocused: false
    };
  }

  public render() {
    return this.programmingTab();
  }

  private programmingTab = () => {
    const qnPath = ['questions', this.props.questionId];
    const path = qnPath.concat([tabPaths[this.state.activeTab]]);

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

    const tabComponent = (
      <div>
        {copyFromEditorButton}
        {copyToEditorButton}
        <br />
        <br />
        {this.editor(path)}
      </div>
    );

    const tabs = [
      {
        label: `Prepend`,
        icon: IconNames.CHEVRON_UP,
        body: tabComponent
      },
      {
        label: `Postpend`,
        icon: IconNames.CHEVRON_DOWN,
        body: tabComponent
      },
      {
        label: `Solution Template`,
        icon: IconNames.MANUAL,
        body: tabComponent
      },
      {
        label: `Suggested Answer`,
        icon: IconNames.TICK,
        body: tabComponent
      }
    ];

    return (
      <SideContent
        activeTab={this.state.activeTab}
        handleChangeActiveTab={this.handleChangeActiveTab}
        tabs={tabs}
      />
    );
  };

  private editor = (path: Array<string | number>) => {
    const value = this.state.templateFocused
      ? this.state.templateValue
      : getValueFromPath(path, this.props.assessment);

    return (
      <div onClick={this.focusEditor(path)} onBlur={this.unFocusEditor(path)}>
        <AceEditor
          className="react-ace"
          editorProps={{
            $blockScrolling: Infinity
          }}
          fontSize={14}
          highlightActiveLine={false}
          mode="javascript"
          onChange={this.handleTemplateChange}
          theme="cobalt"
          value={value}
          width="100%"
        />
      </div>
    );
  };

  private handleChangeActiveTab = (tab: number) => {
    this.setState({
      activeTab: tab
    });
  };

  private handleTemplateChange = (newCode: string) => {
    this.setState({
      templateValue: newCode
    });
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

      if (this.state.activeTab === 0) {
        const editorPrepend = this.state.templateValue;
        this.props.handleUpdateWorkspace({ editorPrepend });
      } else if (this.state.activeTab === 1) {
        const editorPostpend = this.state.templateValue;
        this.props.handleUpdateWorkspace({ editorPostpend });
      }

      this.setState({
        templateValue: '',
        templateFocused: false
      });
    }
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
