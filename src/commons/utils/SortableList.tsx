import { Button } from '@blueprintjs/core';
import { arrayMoveImmutable } from 'array-move';
import React from 'react';
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortableElementProps
} from 'react-sortable-hoc';

type SortableItemProps = SortableElementProps & {
  value: any;
};

const SortableItem = React.memo(
  SortableElement<SortableItemProps>(({ value }: any) => (
    <div>
      <Button>{value}</Button>
    </div>
  ))
);

type SortableListProps = SortableContainerProps & {
  items: string[];
};

export const SortableList = React.memo(
  SortableContainer<SortableListProps>(({ items }: any) => {
    return (
      <div>
        {items &&
          items.map((value: any, index: number) => (
            <SortableItem key={`item-${value}`} index={index} value={value} />
          ))}
      </div>
    );
  })
);

export const useSortableList = () => {
  const [items, setItems] = React.useState<string[]>([]);

  const onSortEnd = React.useCallback(({ oldIndex, newIndex }: any) => {
    setItems(prevState => arrayMoveImmutable(prevState, oldIndex, newIndex));
  }, []);

  return {
    items,
    setItems,
    onSortEnd
  };
};
