import React from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';

type DragReplProps = {
  position: { x: number; y: number };
  onDrag: DraggableEventHandler;
  body: JSX.Element;
  disabled: boolean;
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
          {props.body}
          <div className="block-box"></div>
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableRepl;
