import React, { useRef } from 'react';
import { getDragItem } from '../DragContext';

interface DraggableProps {
  children: React.ReactNode;
  id: number;
}

const Draggable: React.FC<DraggableProps> = ({ children, id }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { setIndex } = getDragItem();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {

    if (elementRef.current) {
      elementRef.current.style.opacity = '0.7';
    // Critical: Set the drag image to be just this element
      e.dataTransfer.setDragImage(elementRef.current, 0, 0);
      setIndex(id);
    }
    
    // Set the effect
    e.dataTransfer.effectAllowed = 'move';
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handleDragEnd = () => {
    // Re-enable text selection
    if (elementRef.current) {
        elementRef.current.style.opacity = '1';
    }
    document.body.style.userSelect = '';
  };

  return (
    <div
      ref={elementRef}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="draggable-element"
      id={id + ""}
    >
      {children}
    </div>
  );
};

export default Draggable;