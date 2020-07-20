import { Button, Intent } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import arrayMove from 'array-move';
import React from 'react';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { useField } from 'src/commons/utils/UseFieldHook';
import {
  deleteChapterRequest,
  updateChapterRequest
} from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import { createChapterIndex } from './StorySimulatorChapterSim';
import { StorySimulatorSortableList } from './StorySimulatorSortableList';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  textAssets?: string[];
};

const inAYear = (oldDate: string) => {
  const closeAt = new Date(oldDate);
  closeAt.setFullYear(closeAt.getFullYear() + 1);
  return closeAt;
};

const emptyStringArray: string[] = [];

const ChapterEditor = ({ chapterDetail, textAssets }: ChapterSimProps) => {
  const { value: title, inputProps: titleProps } = useField(chapterDetail, 'title', '');
  const { value: imageUrl, inputProps: imageUrlProps } = useField(chapterDetail, 'imageUrl', '');
  const { value: openDate, setValue: setOpenDate } = useField(chapterDetail, 'openAt', '');
  const { value: id } = useField(chapterDetail, 'id', '');
  const { value: chosenFiles, setValue: setChosenFiles } = useField<string[]>(
    chapterDetail,
    'filenames',
    emptyStringArray
  );
  const [txtsNotChosen, setTxtsNotChosen] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!textAssets) return;
    setTxtsNotChosen(textAssets.filter(textAsset => !chosenFiles.includes(textAsset)));
  }, [chosenFiles, textAssets]);

  const onSortEnd = React.useCallback(
    ({ oldIndex, newIndex }: any) => {
      setChosenFiles(prevState => arrayMove(prevState, oldIndex, newIndex));
    },
    [setChosenFiles]
  );

  const deleteFileFromChosen = React.useCallback(
    (txtFile: string) => {
      setChosenFiles(prevItemList => prevItemList.filter(item => item !== txtFile));
      setTxtsNotChosen(prevItemList => [...prevItemList, txtFile]);
    },
    [setChosenFiles]
  );

  const addFileToChosen = React.useCallback(
    (txtFile: string) => {
      setChosenFiles(prevItemList => [...prevItemList, txtFile]);
      setTxtsNotChosen(prevItemList => prevItemList.filter(item => item !== txtFile));
    },
    [setChosenFiles]
  );

  const saveChapter = async () => {
    if (!openDate) {
      alert('No open date set');
      return;
    }

    const updatedChapter = {
      openAt: new Date(openDate).toISOString(),
      closeAt: inAYear(openDate).toISOString(),
      title,
      filenames: chosenFiles,
      imageUrl,
      isPublished: false
    };

    const response =
      parseInt(id) === createChapterIndex
        ? await updateChapterRequest('', updatedChapter)
        : await updateChapterRequest(id, { story: updatedChapter });

    alert(response);
  };

  const deleteChapter = async () => {
    const response = await deleteChapterRequest(id);
    alert(response);
  };

  return (
    <>
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
      <b>Checkpoint Txt Files</b>
      <StorySimulatorSortableList
        items={chosenFiles}
        onSortEnd={onSortEnd}
        deleteFileFromChosen={deleteFileFromChosen}
      />
      <br />
      <b>All Txt Files</b>
      {txtsNotChosen &&
        txtsNotChosen.map(textFile => (
          <div>
            <Button
              key={`choice-${textFile}`}
              onClick={() => addFileToChosen(textFile)}
              icon={'add'}
            >
              {textFile}
            </Button>
          </div>
        ))}
      <br />
      <Button icon="play" onClick={saveChapter}>
        Simulate Chapter
      </Button>
      <br />
      <Button onClick={saveChapter}>Save Changes</Button>
      <br />
      <br />
      <Button icon="trash" intent={Intent.WARNING} onClick={deleteChapter}>
        Delete Chapter
      </Button>
    </>
  );
};

export default ChapterEditor;
