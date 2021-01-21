import React from 'react';
import { Prompt } from 'react-router';

import Editor, { EditorProps } from '../editor/Editor';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import MobileSideContent, { MobileSideContentProps } from './mobileSideContent/MobileSideContent';

// TODO: Check prop types again
export type MobileWorkspaceProps = StateProps;

type StateProps = {
  // Either editorProps or mcqProps must be provided

  // TODO: Check what is editorProps and mcqChooserProps doing
  // ControlBar props
  // Repl props
  editorProps?: EditorProps;
  customEditor?: JSX.Element; // NOTE: So far only used in Sourcecast and Sourcereel
  hasUnsavedChanges?: boolean; // Not used in Playground - check in the future
  mcqProps?: McqChooserProps; // Not used in Playground - check in the future
  // TODO: SideContent props
  // TODO: Remove sideContentProps.handleActiveTabChange from Redux... it is local to Workspace (updates active tab in Redux store for no reason)
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

  return (
    <div className="workspace">
      {props.hasUnsavedChanges ? (
        <Prompt
          message={'You have changes that may not be saved. Are you sure you want to leave?'}
        />
      ) : null}
      {/* TODO: Update CSS for mobile-workspace-parent remove flex: row, overflow:hidden, etc. */}
      <div className="workspace-parent">{createWorkspaceInput()}</div>

      {/* TODO: Remove styling */}
      <div
        style={{
          height: '50px', // 80px
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <MobileSideContent />
      </div>
    </div>
  );
};

export default MobileWorkspace;
