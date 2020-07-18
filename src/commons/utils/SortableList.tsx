import { Button } from '@blueprintjs/core';
import arrayMove from 'array-move';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ value }: any) => (
  <div>
    <Button>{value}</Button>
  </div>
));

export const SortableList = SortableContainer(({ items }: any) => {
  return (
    <div>
      {items.map((value: any, index: number) => (
        <SortableItem key={`item-${value}`} index={index} value={value} />
      ))}
    </div>
  );
});

export const useSortableList = (initialValue: string[]) => {
  const [list, setList] = React.useState<string[]>(initialValue);

  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    setList(prevState => arrayMove(prevState, oldIndex, newIndex));
  };

  return {
    list,
    setList,
    bind: {
      items: list,
      onSortEnd
    }
  };
};
