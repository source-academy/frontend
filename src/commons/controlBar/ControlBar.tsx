import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';

export type ControlBarProps = {
  editorButtons: Array<React.ReactElement | null>;
  flowButtons?: Array<React.ReactElement | null>;
  editingWorkspaceButtons?: Array<React.ReactElement | null>;
};

function ControlBar(props: ControlBarProps) {
  const editorControl = (
    <div className={classNames('ControlBar_editor', Classes.BUTTON_GROUP)}>
      {props.editorButtons}
    </div>
  );

  const flowControl = props.flowButtons && (
    <div className={classNames('ControlBar_flow', Classes.BUTTON_GROUP)}>{props.flowButtons}</div>
  );

  const editingWorkspaceControl = (
    <div className={classNames('ControlBar_editingWorkspace', Classes.BUTTON_GROUP)}>
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
}

export default ControlBar;
