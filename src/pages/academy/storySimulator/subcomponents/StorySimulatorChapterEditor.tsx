import { Button } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import arrayMove from 'array-move';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  allCheckpointFilenames: string[];
};

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

export default function ChapterEditor({ chapterDetail, allCheckpointFilenames }: ChapterSimProps) {
  const [openDate, setOpenDate] = React.useState<Date>();
  const [title, setTitle] = React.useState<string>('');

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

  React.useEffect(() => {
    if (!chapterDetail) {
      setOpenDate(undefined);
      setTitle('');
      return;
    }
    setOpenDate(new Date(chapterDetail.openAt));
    setTitle(chapterDetail.title);
  }, [chapterDetail]);

  const handleDateChange = React.useCallback((date: Date) => {
    setOpenDate(date);
  }, []);

  const onViewClick = React.useCallback((e: any) => {
    console.log(e.target);
  }, []);

  function saveOrder() {
    console.log(itemList);
  }
  return (
    <>
      <h4>
        Title: <input className="bp3-input" type="text" placeholder={title} />
      </h4>
      <b>Open date: </b>
      {openDate && getStandardDateTime(openDate.toString())}
      <DatePicker onChange={handleDateChange} />
      <h4>
        Image url: <input className="bp3-input" type="text" placeholder={title} />
        <Button onClick={onViewClick}>View</Button>
      </h4>
      <b>Checkpoint txt files</b>
      <SortableList items={itemList} onSortEnd={onSortEnd} />
      <Button onClick={saveOrder}>Save</Button>
    </>
  );
}
