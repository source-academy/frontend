import { Button } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import React from 'react';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { SortableList, useSortableList } from 'src/commons/utils/SortableList';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import { useInput } from './StorySimulatorInputHook';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  textAssets?: string[];
};

export default function ChapterEditor({ chapterDetail, textAssets }: ChapterSimProps) {
  const { value: title, bind: bindTitle } = useInput(chapterDetail, 'title');
  const { value: imageUrl, bind: bindImageUrl } = useInput(chapterDetail, 'imageUrl');
  const { value: openDate, onDateChange } = useInput(chapterDetail, 'openAt');
  const { itemList, setItemList, bind: bindSortable } = useSortableList([]);

  const [allTxts, setAllTxts] = React.useState<Map<string, boolean>>();

  React.useEffect(() => {
    if (!chapterDetail) {
      setItemList([]);
      return;
    }
    setItemList(chapterDetail.filenames);
  }, [chapterDetail, setItemList]);

  React.useEffect(() => {
    if (!textAssets) return;
    setAllTxts(new Map(textAssets.map(textAssets => [textAssets, false])));
  }, [textAssets]);

  function toggleFileSelection(txtFile: string, added: boolean) {
    added
      ? setItemList(prevItemList => prevItemList.filter(item => item !== txtFile))
      : setItemList(prevItemList => [...prevItemList, txtFile]);

    allTxts && setAllTxts(allTxts.set(txtFile, !added));
  }

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
      {openDate && getStandardDateTime(openDate)}
      <DatePicker onChange={onDateChange} />
      <h4>
        Image url: <input className="bp3-input" type="text" {...bindImageUrl} />
        <Button onClick={(_: any) => window.open(imageUrl)}>View</Button>
      </h4>
      <b>Checkpoint txt files</b>
      <SortableList {...bindSortable} />
      <br />
      <b>All txt files</b>
      {allTxts &&
        Array.from(allTxts).map(([txtFile, added]) => (
          <div>
            <Button
              icon={added ? 'trash' : 'add'}
              onClick={() => toggleFileSelection(txtFile, added)}
            >
              {txtFile}
            </Button>
          </div>
        ))}
      <br />
      <Button onClick={saveOrder}>Save</Button>
    </>
  );
}
