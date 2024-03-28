import { Button, Card, Classes, Divider, IconName, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React, { useState } from 'react';
import AceEditor from 'react-ace';

import { Assessment } from '../assessment/AssessmentTypes';
import ControlButton from '../ControlButton';
import { WorkspaceState } from '../workspace/WorkspaceTypes';
import { assignToPath, getValueFromPath } from './EditingWorkspaceSideContentHelper';

type QuestionEditorProps = DispatchProps & StateProps;

type DispatchProps = {
  updateAssessment: (assessment: Assessment) => void;
  handleEditorValueChange: (newEditorValue: string) => void;
  handleUpdateWorkspace: (options: Partial<WorkspaceState>) => void;
};

type StateProps = {
  assessment: Assessment;
  editorValue: string;
  questionId: number;
};

const questionEditorPaths = ['prepend', 'postpend', 'solutionTemplate', 'answer'] as const;

export type QuestionEditorId = (typeof questionEditorPaths)[number];

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
const ProgrammingQuestionTemplateTab: React.FC<QuestionEditorProps> = props => {
  const [activeEditor, setActiveEditor] = useState(questionEditors[0]);
  const [templateValue, setTemplateValue] = useState('');
  const [templateFocused, setTemplateFocused] = useState(false);

  const programmingTab = () => {
    const qnPath = ['questions', props.questionId];
    const path = qnPath.concat(activeEditor.id);

    const copyFromEditorButton = (
      <ControlButton
        label="Copy from Editor"
        icon={IconNames.IMPORT}
        onClick={handleCopyFromEditor(path)}
      />
    );

    const copyToEditorButton = (
      <ControlButton
        label="Copy to Editor"
        icon={IconNames.EXPORT}
        onClick={handleCopyToEditor(path)}
      />
    );

    const editorPanel = (
      <div>
        {copyFromEditorButton}
        {copyToEditorButton}
        <Divider />
        {editor(path)}
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
          minimal
          text={currentEditor.label}
          icon={IconNames.EDIT}
          rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
        />
      </QuestionEditorSelect>
    );

    return (
      <div className="side-content">
        <Card>
          {editorSelect(activeEditor, setActiveEditor)}
          <Divider />
          <div className="side-content-text">{editorPanel}</div>
        </Card>
      </div>
    );
  };

  const editor = (path: Array<string | number>) => {
    const value = templateFocused ? templateValue : getValueFromPath(path, props.assessment);

    return (
      <div onClick={focusEditor(path)} onBlur={unFocusEditor(path)}>
        <AceEditor
          className="react-ace"
          editorProps={{
            $blockScrolling: Infinity
          }}
          fontSize={14}
          highlightActiveLine={false}
          mode="javascript"
          onChange={setTemplateValue}
          theme="source"
          value={value}
          width="100%"
        />
      </div>
    );
  };

  const focusEditor =
    (path: Array<string | number>) =>
    (e: any): void => {
      if (!templateFocused) {
        setTemplateValue(getValueFromPath(path, props.assessment));
        setTemplateFocused(true);
      }
    };

  const unFocusEditor =
    (path: Array<string | number>) =>
    (e: any): void => {
      if (templateFocused) {
        const value = getValueFromPath(path, props.assessment);
        if (value !== templateValue) {
          const assessmentVal = props.assessment;
          assignToPath(path, templateValue, assessmentVal);
          props.updateAssessment(assessmentVal);
        }

        if (activeEditor.id === 'prepend') {
          const programPrependValue = templateValue;
          props.handleUpdateWorkspace({ programPrependValue });
        } else if (activeEditor.id === 'postpend') {
          const programPostpendValue = templateValue;
          props.handleUpdateWorkspace({ programPostpendValue });
        }

        setTemplateValue('');
        setTemplateFocused(false);
      }
    };

  const handleCopyFromEditor = (path: Array<string | number>) => (): void => {
    const assessment = props.assessment;
    assignToPath(path, props.editorValue, assessment);
    props.updateAssessment(assessment);
  };

  const handleCopyToEditor = (path: Array<string | number>) => (): void => {
    const value = getValueFromPath(path, props.assessment);
    props.handleEditorValueChange(value);
  };

  return programmingTab();
};

export default ProgrammingQuestionTemplateTab;
