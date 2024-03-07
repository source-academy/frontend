import { memo, useState } from 'react';
import { useRequest } from 'src/commons/utils/Hooks';
import { fetchChapters, fetchTextAssets } from 'src/features/gameSimulator/GameSimulatorService';
import { ChapterDetail } from 'src/features/gameSimulator/GameSimulatorTypes';

import ChapterPublisherEditor from './ChapterPublisherEditor';
import { defaultChapter, newChapterIndex } from './ChapterPublisherUtils';

/**
 * This components renders the Chapter Publisher component.
 *
 * @param textAssets - List of all text assets on S3 to choose from.
 */
const ChapterPublisher = memo(() => {
  const { value: textAssets } = useRequest<string[]>(fetchTextAssets, []);
  const { value: chapters } = useRequest<ChapterDetail[]>(fetchChapters, []);

  const [chosenIndex, setChosenIndex] = useState(-1);

  return (
    <>
      <h3>Publish / Edit Chapters</h3>
      <select className="bp4-menu" onChange={(e: any) => setChosenIndex(e.target.key)}>
        {chapters.map((chapter, chapterIndex) => (
          <option key={chapterIndex} value={chapter.title}>
            {`Chapter ${chapterIndex}: ${chapter.title}`}
          </option>
        ))}
        <option key={newChapterIndex} value={''}>{`New chapter`}</option>
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
});

export default ChapterPublisher;
