import React from 'react';
import { useRequest } from 'src/commons/utils/Hooks';
import { fetchChapters } from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import StorySimulatorChapterEditor from './StorySimulatorChapterEditor';

type ChapterSequencerProps = {
  textAssets?: string[];
};

export const inAYear = (date: Date) => {
  date.setFullYear(date.getFullYear() + 1);
  return date;
};

export const createChapterIndex = -1;
const defaultChapter = {
  id: createChapterIndex,
  title: 'title goes here',
  imageUrl: 'https://example.com',
  openAt: new Date().toISOString(),
  closeAt: inAYear(new Date()).toISOString(),
  isPublished: false,
  filenames: []
};

/**
 * This components renders the chapter editor/chapter creator component
 * based on the chapter chosen in the dropdown.
 *
 * @param textAssets - the list of all text assets on S3 to choose from
 */
const ChapterSim = React.memo(({ textAssets }: ChapterSequencerProps) => {
  const { value: chapters } = useRequest<ChapterDetail[]>(fetchChapters, []);
  const [chosenIndex, setChosenIndex] = React.useState(createChapterIndex);

  return (
    <>
      <h3>Chapter Simulator</h3>
      <select className="bp3-menu" onChange={(e: any) => setChosenIndex(e.target.value)}>
        {chapters.map((chapter, index) => {
          return (
            <option value={index} key={index}>
              {`Chapter ${index}: ${chapter.title}`}
            </option>
          );
        })}
        <option value={createChapterIndex} key={createChapterIndex}>
          {`Create new chapter`}
        </option>
      </select>
      <hr />
      <StorySimulatorChapterEditor
        chapterDetail={chapters[chosenIndex] || defaultChapter}
        textAssets={textAssets}
      />
    </>
  );
});
export default ChapterSim;
