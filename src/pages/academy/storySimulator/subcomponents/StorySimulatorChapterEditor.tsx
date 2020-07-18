import { Button } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import React from 'react';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { useInput } from 'src/commons/utils/InputHook';
import { SortableList, useSortableList } from 'src/commons/utils/SortableList';
import ToggleButton from 'src/commons/utils/ToggleButton';
import { updateChapterRequest } from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  textAssets?: string[];
};

const inAYear = (oldDate: string) => {
  const closeAt = new Date(oldDate);
  closeAt.setFullYear(closeAt.getFullYear() + 1);
  return closeAt;
};

export default function ChapterEditor({ chapterDetail, textAssets }: ChapterSimProps) {
  const { value: title, inputProps: titleProps } = useInput(chapterDetail, 'title');
  const { value: imageUrl, inputProps: imageUrlProps } = useInput(chapterDetail, 'imageUrl');
  const { value: openDate, onDateChange } = useInput(chapterDetail, 'openAt');
  const { list: chosenFiles, setList: setChosenFiles, bind: bindSortable } = useSortableList([]);
  const { value: id } = useInput(chapterDetail, 'id');

  React.useEffect(() => {
    if (!chapterDetail) {
      setChosenFiles([]);
      return;
    }
    setChosenFiles(chapterDetail.filenames);
  }, [chapterDetail, setChosenFiles]);

  const toggleFileSelection = React.useCallback(
    (txtFile: string, added: boolean) => {
      added
        ? setChosenFiles(prevItemList => prevItemList.filter(item => item !== txtFile))
        : setChosenFiles(prevItemList => [...prevItemList, txtFile]);
    },
    [setChosenFiles]
  );

  const saveOrder = async () => {
    const resp = await updateChapterRequest(id, {
      openAt: openDate,
      closeAt: inAYear(openDate).toISOString(),
      title,
      filenames: chosenFiles,
      imageUrl,
      isPublished: false
    });
    alert(resp);
  };

  return (
    <>
      <h4>
        Title: <input className="bp3-input" type="text" {...titleProps} />
      </h4>
      <b>Open date: </b>
      {openDate && getStandardDateTime(openDate)}
      <DatePicker onChange={onDateChange} />
      <h4>
        Image url: <input className="bp3-input" type="text" {...imageUrlProps} />
        <Button onClick={(_: any) => window.open(imageUrl)}>View</Button>
      </h4>
      <b>Checkpoint txt files</b>
      <SortableList {...bindSortable} />
      <br />
      <b>All txt files</b>
      {textAssets &&
        textAssets.map(textFile => (
          <ToggleButton
            value={textFile}
            toggleEffect={toggleFileSelection}
            toggleIcons={['trash', 'add']}
          />
        ))}
      <br />
      <Button onClick={saveOrder}>Save</Button>
    </>
  );
}
