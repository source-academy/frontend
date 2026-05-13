import { Button } from '@blueprintjs/core';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useCallback, useState } from 'react';

type SortableItemProps = {
  id: string;
};

const SortableItem = memo(({ id }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Button>{id}</Button>
    </div>
  );
});

type SortableListProps = {
  items: string[];
  onSortEnd: (event: DragEndEvent) => void;
};

export const SortableList = memo(({ items, onSortEnd }: SortableListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSortEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div>
          {items && items.map((value: string) => <SortableItem key={`item-${value}`} id={value} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
});

export const useSortableList = () => {
  const [items, setItems] = useState<string[]>([]);

  const onSortEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems(prevState => {
        const oldIndex = prevState.indexOf(active.id as string);
        const newIndex = prevState.indexOf(over.id as string);

        return arrayMove(prevState, oldIndex, newIndex);
      });
    }
  }, []);

  return {
    items,
    setItems,
    onSortEnd,
  };
};
