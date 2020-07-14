import { Button } from '@blueprintjs/core';
import arrayMove from 'array-move';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ value }: any) => (
  <div>
    <Button>{value}</Button>
  </div>
));

const SortableList = SortableContainer(({ items }: any) => {
  return (
    <div>
      {items.map((value: any, index: number) => (
        <SortableItem key={`item-${value}`} index={index} value={value} />
      ))}
    </div>
  );
});

export default function SortableComponent() {
  const [itemList, setItemList] = React.useState([
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
    'Item 5',
    'Item 6'
  ]);
  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    setItemList(prevState => arrayMove(prevState, oldIndex, newIndex));
  };

  function saveOrder() {
    console.log(itemList);
  }
  return (
    <>
      <SortableList items={itemList} onSortEnd={onSortEnd} />
      <br />
      <Button onClick={saveOrder}>Save</Button>
    </>
  );
}
