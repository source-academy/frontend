import { Button, Classes, Intent, Switch } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import { memo, useCallback, useEffect, useState } from 'react';
import { getStandardDateTime } from 'src/commons/utils/DateHelper';
import { useInput } from 'src/commons/utils/Hooks';
import { SortableList, useSortableList } from 'src/commons/utils/SortableList';
import { defaultChapter } from 'src/features/gameSimulator/GameSimulatorConstants';
import {
  deleteChapterRequest,
  updateChapterRequest
} from 'src/features/gameSimulator/GameSimulatorService';
import { ChapterSimProps } from 'src/features/gameSimulator/GameSimulatorTypes';
import { dateOneYearFromNow } from 'src/features/gameSimulator/GameSimulatorUtils';

/**
 * This component renders the Chapter Publishing form to create new chapters.
 *
 * @param chapterDetail The starting state of the form, either loaded from defaultChapter
 *                      if the user wants to create a new chapter, or loaded from
 *                      existing chapters if user wants to edit the selected chapter.
 * @param chapterFilenames List of all text asset filenames on S3 to choose from.
 */
const ChapterPublisherEditor: React.FC<ChapterSimProps> = ({ chapterDetail, chapterFilenames }) => {
  const { id } = chapterDetail;
  const { value: title, setValue: setTitle, inputProps: titleProps } = useInput('');
  const { value: imageUrl, setValue: setImageUrl, inputProps: imageUrlProps } = useInput('');
  const { items: chosenFiles, setItems: setChosenFiles, onSortEnd } = useSortableList();

  const [isPublished, setIsPublished] = useState(false);
  const [openDate, setOpenDate] = useState<Date>(new Date());
  const [txtsNotChosen, setTxtsNotChosen] = useState<string[]>([]);
  const [rerender, setRender] = useState(false);

  useEffect(() => {
    setTitle(chapterDetail.title);
    setImageUrl(chapterDetail.imageUrl);
    setOpenDate(new Date(chapterDetail.openAt));
    setChosenFiles(chapterDetail.filenames);
    setIsPublished(chapterDetail.isPublished);
    setTxtsNotChosen(
      (chapterFilenames || []).filter(textAsset => !chapterDetail.filenames.includes(textAsset))
    );
  }, [
    chapterDetail,
    setChosenFiles,
    setImageUrl,
    setOpenDate,
    setTitle,
    chapterFilenames,
    rerender
  ]);

  const deleteAllFromChosen = () => chosenFiles.map(deleteFileFromChosen);

  const deleteFileFromChosen = useCallback(
    (txtFile: string) => {
      setChosenFiles(prevItemList => prevItemList.filter(item => item !== txtFile));
      setTxtsNotChosen(prevItemList => [...prevItemList, txtFile]);
    },
    [setChosenFiles]
  );

  const addFileToChosen = useCallback(
    (txtFile: string) => {
      setChosenFiles(prevItemList => [...prevItemList, txtFile]);
      setTxtsNotChosen(prevItemList => prevItemList.filter(item => item !== txtFile));
    },
    [setChosenFiles]
  );

  const saveChapter = async () => {
    const updatedChapter = {
      openAt: openDate.toISOString(),
      closeAt: dateOneYearFromNow(openDate).toISOString(),
      title,
      filenames: chosenFiles,
      imageUrl,
      isPublished
    };

    const confirm = window.confirm(
      `Are you sure you want to save changes to Chapter ${id}: ${title}?\n\nChapter Information: ${JSON.stringify(
        updatedChapter
      )}`
    );
    if (!confirm) {
      return;
    }
    const response =
      parseInt(id) === defaultChapter.id
        ? await updateChapterRequest('', { story: updatedChapter })
        : await updateChapterRequest(id, { story: updatedChapter });

    alert(response);
  };

  const deleteChapter = async () => {
    const confirm = window.confirm(`Are you sure you want to delete Chapter ${id}: ${title}?`);
    if (confirm) {
      const response = await deleteChapterRequest(id);
      alert(response);
    }
  };

  const clearChanges = () => {
    const confirm = window.confirm(
      `Are you sure you want to clear changes for Chapter ${id}: ${title}?`
    );
    if (confirm) {
      setRender(!rerender);
      alert('Cleared changes');
    }
  };

  return (
    <>
      <h4>
        Title:{' '}
        <input className={Classes.INPUT} type="text" placeholder="New title" {...titleProps} />
      </h4>
      <b>Open date: </b>
      {openDate && getStandardDateTime(openDate.toISOString())}
      <DatePicker
        onChange={(date: Date | null) => {
          if (!date) {
            return;
          }
          setOpenDate(date);
        }}
        showActionsBar
        highlightCurrentDay
      />
      <h4>
        Chapter Preview Image URL:{' '}
        <input className={Classes.INPUT} type="text" {...imageUrlProps} />
      </h4>
      <h4>Chapter Files (.txt):</h4>
      <SortableList items={chosenFiles} onSortEnd={onSortEnd} />
      {chosenFiles.length > 0 ? (
        <>
          <br />
          <Button icon="delete" onClick={deleteAllFromChosen}>
            Clear all selected files
          </Button>
          <br />
        </>
      ) : (
        <p>No file has been selected yet.</p>
      )}
      <br />
      <h4>All Available Chapter Files (.txt)</h4>
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
      <hr />
      <br />
      <Switch
        checked={isPublished}
        labelElement="Published"
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
};

export default memo(ChapterPublisherEditor);
