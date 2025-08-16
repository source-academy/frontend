import { Classes } from '@blueprintjs/core';
import clsx from 'clsx';
import React from 'react';

export type ControlBarProps = {
  editorButtons: Array<JSX.Element | null>;
  flowButtons?: Array<JSX.Element | null>;
  editingWorkspaceButtons?: Array<JSX.Element | null>;
};

const ControlBar: React.FC<ControlBarProps> = props => {
  const editorControl = (
    <div className={clsx('ControlBar_editor', Classes.BUTTON_GROUP)}>{props.editorButtons}</div>
  );

  const flowControl = props.flowButtons && (
    <div className={clsx('ControlBar_flow', Classes.BUTTON_GROUP)}>{props.flowButtons}</div>
  );

  const editingWorkspaceControl = (
    <div className={clsx('ControlBar_editingWorkspace', Classes.BUTTON_GROUP)}>
      {props.editingWorkspaceButtons}
    </div>
  );

  return (
    <div className="ControlBar">
      {editorControl}
      {flowControl}
      {editingWorkspaceControl}
    </div>
  );
};

export default ControlBar;
