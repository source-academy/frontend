import { Button } from '@blueprintjs/core';
import arrayMove from 'array-move';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { fetchChapters } from 'src/features/storySimulator/StorySimulatorService';

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

type ChapterSequencerProps = {
  accessToken?: string;
};

export default function ChapterSequencer({ accessToken }: ChapterSequencerProps) {
  const [chapters, setChapters] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      setChapters(await fetchChapters(accessToken));
    })();
  }, [accessToken]);

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
      <h3>Chapter Sequencer</h3>
      <select className="bp3-menu">
        {chapters.map(chapter => {
          console.log(chapter);
          return <option value={chapter.toString()} />;
        })}
      </select>
      <SortableList items={itemList} onSortEnd={onSortEnd} />
      <br />
      <Button onClick={saveOrder}>Save</Button>
    </>
  );
}
