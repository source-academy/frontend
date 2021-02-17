import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';

export type ControlBarProps = OwnProps;

type OwnProps = {
  editorButtons: Array<JSX.Element | null>;
  flowButtons?: Array<JSX.Element | null>;
  editingWorkspaceButtons?: Array<JSX.Element | null>;
};

function ControlBar(props: ControlBarProps) {
  const editorControl = () => {
    return (
      <div className={classNames('ControlBar_editor', Classes.BUTTON_GROUP)}>
        {props.editorButtons}
      </div>
    );
  };

  const flowControl = () => {
    return (
      props.flowButtons && (
        <div className={classNames('ControlBar_flow', Classes.BUTTON_GROUP)}>
          {props.flowButtons}
        </div>
      )
    );
  };

  const editingWorkspaceControl = () => {
    return (
      <div className={classNames('ControlBar_editingWorkspace', Classes.BUTTON_GROUP)}>
        {props.editingWorkspaceButtons}
      </div>
    );
  };

  return (
    <div className="ControlBar">
      {editorControl()}
      {flowControl()}
      {editingWorkspaceControl()}
    </div>
  );
}

export default ControlBar;
