import { Button, Intent, Switch } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import React from 'react';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { useInput } from 'src/commons/utils/Hooks';
import { SortableList, useSortableList } from 'src/commons/utils/SortableList';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import { toS3Path } from 'src/features/game/utils/GameUtils';
import { callGameManagerForSim } from 'src/features/game/utils/TxtLoaderUtils';
import {
  deleteChapterRequest,
  updateChapterRequest
} from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import { createChapterIndex, inAYear } from './StorySimulatorChapterSim';

type ChapterSimProps = {
  chapterDetail: ChapterDetail;
  checkpointFilenames?: string[];
};

/**
 * This is the Chapter Editor Form that
 * storywriters use to either create
 * or udpate chapters for the game.
 *
 * @param chapterDetail the starting state of the form,
 *                      either loaded from defaultChapter if user wants to create a new chapter
 *                      or loaded from the existing chapter if user wants to edit the chapter
 * @param checkpointFilenames the list of all checkpoint text files to choose from
 */
const ChapterEditor = React.memo(({ chapterDetail, checkpointFilenames }: ChapterSimProps) => {
  const { id } = chapterDetail;
  const { value: title, setValue: setTitle, inputProps: titleProps } = useInput('');
  const { value: imageUrl, setValue: setImageUrl, inputProps: imageUrlProps } = useInput('');
  const { items: chosenFiles, setItems: setChosenFiles, onSortEnd } = useSortableList();

  const [isPublished, setIsPublished] = React.useState(false);
  const [openDate, setOpenDate] = React.useState<Date>(new Date());
  const [txtsNotChosen, setTxtsNotChosen] = React.useState<string[]>([]);
  const [rerender, setRender] = React.useState(false);

  React.useEffect(() => {
    setTitle(chapterDetail.title);
    setImageUrl(chapterDetail.imageUrl);
    setOpenDate(new Date(chapterDetail.openAt));
    setChosenFiles(chapterDetail.filenames);
    setIsPublished(chapterDetail.isPublished);
    setTxtsNotChosen(
      (checkpointFilenames || []).filter(textAsset => !chapterDetail.filenames.includes(textAsset))
    );
  }, [
    chapterDetail,
    setChosenFiles,
    setImageUrl,
    setOpenDate,
    setTitle,
    checkpointFilenames,
    rerender
  ]);

  const deleteAllFromChosen = () => chosenFiles.map(deleteFileFromChosen);

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

    const confirm = window.confirm(
      `Are you sure you want to save changes to ${JSON.stringify(updatedChapter)}`
    );
    if (!confirm) {
      return;
    }
    const response =
      parseInt(id) === createChapterIndex
        ? await updateChapterRequest('', { story: updatedChapter })
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
      setRender(!rerender);
      alert('Cleared changes');
    }
  };

  const simulateChapter = async () => {
    SourceAcademyGame.getInstance().setChapterSimStack(chosenFiles);
    await callGameManagerForSim();
  };

  return (
    <>
      <h4>
        Title: <input className="bp4-input" type="text" {...titleProps} />
      </h4>
      <b>Open date: </b>
      {openDate && getStandardDateTime(openDate.toISOString())}
      <DatePicker
        onChange={(date: Date) => {
          date && setOpenDate(date);
        }}
      />
      <h4>
        Image url: <input className="bp4-input" type="text" {...imageUrlProps} />
        <Button onClick={(_: any) => window.open(toS3Path(imageUrl, true))}>View</Button>
      </h4>
      <b>Checkpoint Txt Files</b>
      <SortableList items={chosenFiles} onSortEnd={onSortEnd} />
      <br />
      {chosenFiles.length > 0 && (
        <Button icon={'delete'} onClick={deleteAllFromChosen}>
          Clear checkpoint files
        </Button>
      )}
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
      <Button icon="play" onClick={simulateChapter}>
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
