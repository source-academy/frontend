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

  const [chosenIndex, setChosenIndex] = useState(-1);

  return (
    <>
      <h3>Publish / Edit Chapters</h3>
      <select className="bp5-menu" onChange={(e: any) => setChosenIndex(e.target.key)}>
        {chapters.map((chapter, chapterIndex) => (
          <option key={chapterIndex} value={chapter.title}>
            {`Chapter ${chapterIndex}: ${chapter.title}`}
          </option>
        ))}
        <option key={defaultChapter.id} value="">
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
