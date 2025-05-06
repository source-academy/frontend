import { createContext, useContext } from 'react';

type DragContextProps = {
  index: number | null;
  setIndex: (index: number) => void;
};

export const DragContext = createContext<DragContextProps | null>(null);

export const useDragItem = () => {
  const dragItem = useContext(DragContext);

  if (dragItem == null) {
    throw Error('Drag Context cannot be null when in use');
  }

  return dragItem;
};
