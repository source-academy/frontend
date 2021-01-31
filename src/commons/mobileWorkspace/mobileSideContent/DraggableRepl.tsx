import React from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import styled from 'styled-components';

const DraggablePanel = styled.div`
  width: 100%;
  min-height: 1000px;
  z-index: 2;
  position: fixed;
  bottom: -930px;
  background-color: #34495e;
  border-radius: 5px;
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.3), 0 -10px 20px rgba(0, 0, 0, 0.2);
`;

const DragHandle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  height: 14px;
  width: 100%;
  background-color: #182026;
  box-shadow: inset 0 -1px 8px -3px rgba(200, 200, 200, 0.4);
  cursor: pointer;
`;

const ReplContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
`;
const Circle = styled.div`
  height: 6px;
  width: 6px;
  margin: 0 8px;
  border-radius: 50%;
  background-color: grey;
`;

type DragReplProps = {
  position: { x: number; y: number };
  onDrag: DraggableEventHandler;
  body: JSX.Element;
};

const DraggableRepl: React.FC<DragReplProps> = props => {
  return (
    <Draggable
      axis="y"
      handle="#draghandle"
      position={props.position}
      bounds={{ top: -500, left: 0, right: 0, bottom: 0 }}
      onDrag={props.onDrag}
    >
      <DraggablePanel>
        <DragHandle id="draghandle">
          {['1', '2', '3'].map(i => (
            <Circle key={i} />
          ))}
        </DragHandle>
        <ReplContent>{props.body}</ReplContent>
      </DraggablePanel>
    </Draggable>
  );
};

export default DraggableRepl;
