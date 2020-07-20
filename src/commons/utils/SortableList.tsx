import { Button } from '@blueprintjs/core';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ value }: any) => (
  <div>
    <Button>{value}</Button>
  </div>
));

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
