import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

export type ControlBarProps = OwnProps;

type OwnProps = {
  editorButtons: Array<JSX.Element | null>;
  flowButtons?: Array<JSX.Element | null>;
  replButtons: Array<JSX.Element | null>;
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

  const replControl = () => {
    return (
      <div className={classNames('ControlBar_repl', Classes.BUTTON_GROUP)}>{props.replButtons}</div>
    );
  };

  return (
    <div className="ControlBar">
      {editorControl()}
      {flowControl()}
      {replControl()}
    </div>
  );
}

export default ControlBar;
