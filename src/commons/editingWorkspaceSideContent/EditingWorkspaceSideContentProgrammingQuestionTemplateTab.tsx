import { Button, Card, Classes, Divider, IconName, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import AceEditor from 'react-ace';

import { Assessment } from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';
import { WorkspaceState } from '../workspace/WorkspaceTypes';
import { assignToPath, getValueFromPath } from './EditingWorkspaceSideContentHelper';

type QuestionEditorProps = DispatchProps & StateProps;

type DispatchProps = {
  updateAssessment: (assessment: Assessment) => void;
  handleEditorValueChange: (val: string) => void;
  handleUpdateWorkspace: (options: Partial<WorkspaceState>) => void;
};

type StateProps = {
  assessment: Assessment;
  editorValue: string | null;
  questionId: number;
};

type OwnProps = {
  activeEditor: QuestionEditor;
  templateValue: string;
  templateFocused: boolean;
};

const questionEditorPaths = ['prepend', 'postpend', 'solutionTemplate', 'answer'] as const;

export type QuestionEditorId = typeof questionEditorPaths[number];

const QuestionEditorSelect = Select.ofType<QuestionEditor>();

export type QuestionEditor = {
  label: string;
  icon: IconName;
  id: QuestionEditorId;
};

const questionEditors: QuestionEditor[] = [
  {
    label: 'Prepend',
    icon: IconNames.CHEVRON_UP,
    id: 'prepend'
  },
  {
    label: 'Postpend',
    icon: IconNames.CHEVRON_DOWN,
    id: 'postpend'
  },
  {
    label: 'Solution Template',
    icon: IconNames.MANUAL,
    id: 'solutionTemplate'
  },
  {
    label: 'Suggested Answer',
    icon: IconNames.TICK,
    id: 'answer'
  }
];

/*
 * activeEditor is the default editor to show initially
 */
export class ProgrammingQuestionTemplateTab extends React.Component<QuestionEditorProps, OwnProps> {
  public constructor(props: QuestionEditorProps) {
    super(props);
    this.state = {
      activeEditor: questionEditors[0],
      templateValue: '',
      templateFocused: false
    };
  }

  public render() {
    return this.programmingTab();
  }

  private programmingTab = () => {
    const qnPath = ['questions', this.props.questionId];
    const path = qnPath.concat(this.state.activeEditor.id);

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

    const editorPanel = (
      <div>
        {copyFromEditorButton}
        {copyToEditorButton}
        <Divider />
        {this.editor(path)}
      </div>
    );

    const menuRenderer: ItemRenderer<QuestionEditor> = (editor, { handleClick }) => (
      <MenuItem
        active={false}
        key={editor.id}
        onClick={handleClick}
        text={editor.label}
        icon={editor.icon}
      />
    );

    const editorSelect = (
      currentEditor: QuestionEditor,
      handleSelect: (i: QuestionEditor) => void
    ) => (
      <QuestionEditorSelect
        className={Classes.MINIMAL}
        items={questionEditors}
        itemRenderer={menuRenderer}
        onItemSelect={handleSelect}
        filterable={false}
      >
        <Button
          className={Classes.MINIMAL}
          text={currentEditor.label}
          icon={IconNames.EDIT}
          rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
        />
      </QuestionEditorSelect>
    );

    return (
      <div className="side-content">
        <Card>
          {editorSelect(this.state.activeEditor, this.handleChangeActiveEditor)}
          <Divider />
          <div className="side-content-text">{editorPanel}</div>
        </Card>
      </div>
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
          theme="source"
          value={value}
          width="100%"
        />
      </div>
    );
  };

  private handleChangeActiveEditor = (editor: QuestionEditor) => {
    this.setState({
      activeEditor: editor
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

      if (this.state.activeEditor.id === 'prepend') {
        const editorPrepend = this.state.templateValue;
        this.props.handleUpdateWorkspace({ editorPrepend });
      } else if (this.state.activeEditor.id === 'postpend') {
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
