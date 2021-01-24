import React from 'react';
import { Prompt } from 'react-router';

import Editor, { EditorProps } from '../editor/Editor';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import Repl, { ReplProps } from '../repl/Repl';
import MobileSideContent, { MobileSideContentProps } from './mobileSideContent/MobileSideContent';

export type MobileWorkspaceProps = StateProps;

type StateProps = {
  // Either editorProps or mcqProps must be provided

  // TODO: Check what is editorProps and mcqChooserProps doing
  // ControlBar props
  editorProps?: EditorProps;
  customEditor?: JSX.Element; // NOTE: So far only used in Sourcecast and Sourcereel
  hasUnsavedChanges?: boolean; // Not used in Playground - check in the future
  mcqProps?: McqChooserProps; // Not used in Playground - check in the future
  replProps: ReplProps;
  mobileSideContentProps: MobileSideContentProps;
};

const MobileWorkspace: React.FC<MobileWorkspaceProps> = props => {
  const createWorkspaceInput = () => {
    if (props.customEditor) {
      return props.customEditor;
    } else if (props.editorProps) {
      return <Editor {...props.editorProps} />;
    } else {
      return <McqChooser {...props.mcqProps!} />;
    }
  };

  const createReplOutput = () => {
    return <Repl {...props.replProps} />;
  };

  const createEditorProps = {
    createWorkspaceInput: createWorkspaceInput,
    createReplOutput: createReplOutput
  };

  return (
    <div className="workspace">
      {props.hasUnsavedChanges ? (
        <Prompt
          message={'You have changes that may not be saved. Are you sure you want to leave?'}
        />
      ) : null}

      {/* TODO: Update CSS for mobile workspace-parent remove flex: row, overflow:hidden, etc. */}

      <MobileSideContent {...props.mobileSideContentProps} {...createEditorProps} />
    </div>
  );
};

export default MobileWorkspace;
