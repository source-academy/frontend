import { Button } from '@blueprintjs/core';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const StorySimulatorSortableItem = React.memo(
  SortableElement(({ value, deleteFileFromChosen }: any) => (
    <div>
      <Button>{value}</Button>{' '}
      <Button
        onClick={() => {
          deleteFileFromChosen(value);
        }}
      >
        -
      </Button>
    </div>
  ))
);

export const StorySimulatorSortableList = React.memo(
  SortableContainer(({ items, deleteFileFromChosen }: any) => {
    return (
      <div>
        {items &&
          items.map((value: any, index: number) => (
            <StorySimulatorSortableItem
              key={`item-${value}`}
              index={index}
              value={value}
              deleteFileFromChosen={deleteFileFromChosen}
            />
          ))}
      </div>
    );
  })
);
