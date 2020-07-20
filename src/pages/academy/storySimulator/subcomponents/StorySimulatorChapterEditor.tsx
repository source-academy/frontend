import { Button } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import arrayMove from 'array-move';
import React from 'react';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { SortableList } from 'src/commons/utils/SortableList';
import ToggleButton from 'src/commons/utils/ToggleButton';
import { useField } from 'src/commons/utils/UseFieldHook';
import { updateChapterRequest } from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  textAssets?: string[];
};

const inAYear = (oldDate: string) => {
  const closeAt = new Date(oldDate);
  closeAt.setMonth(closeAt.getMonth() + 7);
  return closeAt;
};

const emptyStringArray: string[] = [];

export default function ChapterEditor({ chapterDetail, textAssets }: ChapterSimProps) {
  const { value: title, inputProps: titleProps } = useField(chapterDetail, 'title', '');
  const { value: imageUrl, inputProps: imageUrlProps } = useField(chapterDetail, 'imageUrl', '');
  const { value: openDate, setValue: setOpenDate } = useField(chapterDetail, 'openAt', '');
  const { value: id } = useField(chapterDetail, 'id', '');
  const { value: chosenFiles, setValue: setChosenFiles } = useField<string[]>(
    chapterDetail,
    'filenames',
    emptyStringArray
  );

  const onSortEnd = React.useCallback(
    ({ oldIndex, newIndex }: any) => {
      setChosenFiles(prevState => arrayMove(prevState, oldIndex, newIndex));
    },
    [setChosenFiles]
  );

  const toggleFileSelection = React.useCallback(
    (txtFile: string, added: boolean) => {
      added
        ? setChosenFiles(prevItemList => prevItemList.filter(item => item !== txtFile))
        : setChosenFiles(prevItemList => [...prevItemList, txtFile]);
    },
    [setChosenFiles]
  );

  const saveChapter = async () => {
    const response = await updateChapterRequest(parseInt(id) >= 0 ? id : '', {
      openAt: new Date(openDate).toISOString(),
      closeAt: inAYear(openDate).toISOString(),
      title,
      filenames: [],
      imageUrl,
      isPublished: false
    });
    alert(response);
  };

  return (
    <>
      <Button onClick={saveChapter}>Simulate Chapter</Button>

      <h4>
        Title: <input className="bp3-input" type="text" {...titleProps} />
      </h4>
      <b>Open date: </b>
      {openDate && getStandardDateTime(openDate)}
      <DatePicker
        onChange={(date: Date) => {
          date && setOpenDate(date.toString());
        }}
      />
      <h4>
        Image url: <input className="bp3-input" type="text" {...imageUrlProps} />
        <Button onClick={(_: any) => window.open(imageUrl)}>View</Button>
      </h4>
      <b>Checkpoint txt files</b>
      <SortableList items={chosenFiles} onSortEnd={onSortEnd} />
      <br />
      <b>All txt files</b>
      {textAssets &&
        textAssets.map(textFile => (
          <ToggleButton
            key={textFile}
            value={textFile}
            toggleEffect={toggleFileSelection}
            toggleIcons={['trash', 'add']}
          />
        ))}
      <br />
      <Button onClick={saveChapter}>Save Changes</Button>
      <Button onClick={saveChapter}>Delete</Button>
    </>
  );
}
