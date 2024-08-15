import { Classes } from '@blueprintjs/core';
import { memo, useState } from 'react';
import { useRequest } from 'src/commons/utils/Hooks';
import { defaultChapter } from 'src/features/gameSimulator/GameSimulatorConstants';
import { fetchChapters, fetchTextAssets } from 'src/features/gameSimulator/GameSimulatorService';
import { ChapterDetail } from 'src/features/gameSimulator/GameSimulatorTypes';

import ChapterPublisherEditor from './ChapterPublisherEditor';

/**
 * This components renders the Chapter Publisher component in the Game Simulator.
 *
 * @param textAssets - List of all text assets on S3 to choose from.
 */
const ChapterPublisher: React.FC = () => {
  const { value: textAssets } = useRequest<string[]>(fetchTextAssets, []);
  const { value: chapters } = useRequest<ChapterDetail[]>(fetchChapters, []);

  const [chosenIndex, setChosenIndex] = useState(defaultChapter.id);

  return (
    <>
      <h3>Publish / Edit Chapters</h3>
      <select
        className={Classes.MENU}
        onChange={(e: any) => {
          setChosenIndex(e.target.value);
        }}
      >
        {chapters.map((chapter, chapterIndex) => (
          <option value={chapterIndex} key={chapterIndex}>
            {`Chapter ${chapterIndex}: ${chapter.title}`}
          </option>
        ))}
        <option value={defaultChapter.id} key={defaultChapter.id}>
          New chapter
        </option>
      </select>
      <br />
      <br />
      <hr />
      <ChapterPublisherEditor
        chapterDetail={chapters[chosenIndex] || defaultChapter}
        chapterFilenames={textAssets}
      />
    </>
  );
};

export default memo(ChapterPublisher, () => true);
