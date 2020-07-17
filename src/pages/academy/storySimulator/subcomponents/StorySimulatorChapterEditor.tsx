import { Button } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import arrayMove from 'array-move';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import { useInput } from './StorySimulatorFormHook';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  allCheckpointFilenames?: string[];
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
  const { value: title, setValue: setTitle, bind: bindTitle } = useInput(chapterDetail, 'title');
  const { value: imageUrl, setValue: setImageUrl, bind: bindImageUrl } = useInput(
    chapterDetail,
    'imageUrl'
  );

  const [itemList, setItemList] = React.useState<string[]>([]);

  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    setItemList(prevState => arrayMove(prevState, oldIndex, newIndex));
  };

  React.useEffect(() => {
    if (!chapterDetail) {
      setOpenDate(undefined);
      return;
    }
    setOpenDate(new Date(chapterDetail.openAt));
  }, [chapterDetail, setImageUrl, setTitle]);

  const handleDateChange = React.useCallback((date: Date) => {
    setOpenDate(date);
  }, []);

  const onViewClick = (e: any) => {
    window.open(imageUrl);
  };

  function saveOrder() {
    console.log(title);
    console.log(itemList);
  }
  return (
    <>
      <h4>
        Title: <input className="bp3-input" type="text" {...bindTitle} />
      </h4>
      <b>Open date: </b>
      {openDate && getStandardDateTime(openDate.toString())}
      <DatePicker onChange={handleDateChange} />
      <h4>
        Image url: <input className="bp3-input" type="text" {...bindImageUrl} />
        <Button onClick={onViewClick}>View</Button>
      </h4>
      <b>Checkpoint txt files</b>
      <SortableList items={itemList} onSortEnd={onSortEnd} />
      <Button onClick={saveOrder}>Save</Button>
    </>
  );
}
