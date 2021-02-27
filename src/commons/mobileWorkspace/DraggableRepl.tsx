import React from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';

import Repl, { ReplProps } from '../repl/Repl';

type DragReplProps = {
  position: { x: number; y: number };
  onDrag: DraggableEventHandler;
  disabled: boolean;
  replProps: ReplProps;
};

const DraggableRepl: React.FC<DragReplProps> = props => {
  return (
    <Draggable
      axis="y"
      handle="#draghandle"
      position={props.position}
      bounds={{ top: -500, left: 0, right: 0, bottom: 0 }}
      onDrag={props.onDrag}
      disabled={props.disabled}
    >
      <div className="mobile-draggable">
        {!props.disabled ? (
          <div className="handle enabled" id="draghandle">
            {['1', '2', '3'].map(i => (
              <div className="circle" key={i} />
            ))}
          </div>
        ) : (
          <div className="handle disabled" id="draghandle">
            {['1', '2', '3'].map(i => (
              <div className="circle" key={i} />
            ))}
          </div>
        )}
        <div className="REPL-content">
          <Repl {...props.replProps} />
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableRepl;
