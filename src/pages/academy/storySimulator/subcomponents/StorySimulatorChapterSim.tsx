import React from 'react';
import { useRequest } from 'src/commons/utils/UseFieldHook';
import { fetchChapters } from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import StorySimulatorChapterEditor from './StorySimulatorChapterEditor';

type ChapterSequencerProps = {
  textAssets?: string[];
};

/**
 * This components renders
 *
 * @param textAssets - the list of all text assets on S3 to choose from
 */
export default function ChapterSim({ textAssets }: ChapterSequencerProps) {
  const { value: chapters } = useRequest<ChapterDetail[]>(fetchChapters, []);
  const [chosenIndex, setChosenIndex] = React.useState(-1);

  return (
    <>
      <h3>Chapter Simulator</h3>
      <select
        className="bp3-menu"
        defaultValue={0}
        onChange={(e: any) => setChosenIndex(e.target.value)}
      >
        {chapters.map((chapter, index) => {
          return (
            <option value={index} key={index}>
              {`Chapter ${index}: ${chapter.title}`}
            </option>
          );
        })}
        <option value={-1} key={-1}>
          {`Create new chapter`}
        </option>
      </select>
      <hr />
      <StorySimulatorChapterEditor chapterDetail={chapters[chosenIndex]} textAssets={textAssets} />
    </>
  );
}
