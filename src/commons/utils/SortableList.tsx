import { Button } from '@blueprintjs/core';
import { arrayMoveImmutable } from 'array-move';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = React.memo(
  SortableElement(({ value }: any) => (
    <div>
      <Button>{value}</Button>
    </div>
  ))
);

export const SortableList = React.memo(
  SortableContainer(({ items }: any) => {
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
