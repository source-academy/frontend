import { Button, Intent, Switch } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import arrayMove from 'array-move';
import React from 'react';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { useInput } from 'src/commons/utils/Hooks';
import { toS3Path } from 'src/features/game/utils/GameUtils';
import {
  deleteChapterRequest,
  updateChapterRequest
} from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import { createChapterIndex, inAYear } from './StorySimulatorChapterSim';
import { StorySimulatorSortableList } from './StorySimulatorSortableList';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  textAssets?: string[];
};

const emptyStringArray: string[] = [];

const ChapterEditor = React.memo(({ chapterDetail, textAssets }: ChapterSimProps) => {
  const { id } = chapterDetail;
  const { value: title, setValue: setTitle, inputProps: titleProps } = useInput('');
  const { value: imageUrl, setValue: setImageUrl, inputProps: imageUrlProps } = useInput('');

  const [isPublished, setIsPublished] = React.useState(false);
  const [openDate, setOpenDate] = React.useState<Date>(new Date());
  const [chosenFiles, setChosenFiles] = React.useState<string[]>(emptyStringArray);
  const [txtsNotChosen, setTxtsNotChosen] = React.useState<string[]>([]);
  const [rerender, setRender] = React.useState(0);

  React.useEffect(() => {
    setTitle(chapterDetail.title);
    setImageUrl(chapterDetail.imageUrl);
    setOpenDate(new Date(chapterDetail.openAt));
    setChosenFiles(chapterDetail.filenames);
    setIsPublished(chapterDetail.isPublished);
    setTxtsNotChosen(
      (textAssets || []).filter(textAsset => !chapterDetail.filenames.includes(textAsset))
    );
  }, [chapterDetail, setChosenFiles, setImageUrl, setOpenDate, setTitle, textAssets, rerender]);

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
    const updatedChapter = {
      openAt: openDate.toISOString(),
      closeAt: inAYear(openDate).toISOString(),
      title,
      filenames: chosenFiles,
      imageUrl,
      isPublished
    };

    const response =
      parseInt(id) === createChapterIndex
        ? await updateChapterRequest('', updatedChapter)
        : await updateChapterRequest(id, { story: updatedChapter });

    alert(response);
  };

  const deleteChapter = async () => {
    const confirm = window.confirm('Are you sure you want to delete this chapter?');
    if (confirm) {
      const response = await deleteChapterRequest(id);
      alert(response);
    }
  };

  const clearChanges = () => {
    const confirm = window.confirm('Are you you want to clear changes for this chapter?');
    if (confirm) {
      // Change render to random variable to trigger rerender of component
      setRender(Math.random());
      alert('Cleared changes');
    }
  };

  return (
    <>
      <h4>
        Title: <input className="bp3-input" type="text" {...titleProps} />
      </h4>
      <b>Open date: </b>
      {openDate && getStandardDateTime(openDate.toISOString())}
      <DatePicker
        onChange={(date: Date) => {
          date && setOpenDate(date);
        }}
      />
      <h4>
        Image url: <input className="bp3-input" type="text" {...imageUrlProps} />
        <Button onClick={(_: any) => window.open(toS3Path(imageUrl))}>View</Button>
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
        txtsNotChosen.map(textFile => {
          return (
            <div key={`choice-${textFile}`}>
              <Button onClick={() => addFileToChosen(textFile)} icon={'add'}>
                {textFile}
              </Button>
            </div>
          );
        })}
      <br />
      <Button icon="play" onClick={() => {}}>
        Simulate Chapter
      </Button>
      <br />
      <br />
      <Switch
        checked={isPublished}
        labelElement={'Published'}
        onChange={() => setIsPublished(!isPublished)}
      />
      <Button onClick={saveChapter}>Save Changes</Button>
      <Button intent={Intent.WARNING} onClick={clearChanges}>
        Clear Changes
      </Button>
      <br />
      <br />
      <Button icon="trash" intent={Intent.DANGER} onClick={deleteChapter}>
        Delete Chapter
      </Button>
    </>
  );
});

export default ChapterEditor;
