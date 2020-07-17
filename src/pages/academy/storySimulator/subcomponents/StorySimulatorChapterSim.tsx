import React from 'react';
import {
  createChapterRequest,
  fetchChapters
} from 'src/features/storySimulator/StorySimulatorService';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

import StorySimulatorChapterEditor from './StorySimulatorChapterEditor';

type ChapterSequencerProps = {
  accessToken?: string;
};

export default function ChapterSim({ accessToken }: ChapterSequencerProps) {
  const [chapters, setChapters] = React.useState<ChapterDetail[]>([]);
  const [chosenIndex, setChosenIndex] = React.useState(-1);

  React.useEffect(() => {
    (async () => {
      setChapters(await fetchChapters(accessToken));
    })();
  }, [accessToken]);

  const onCreateButtonClick = React.useCallback(async () => {
    alert(await createChapterRequest(accessToken));
  }, [accessToken]);

  const onChangeChapter = React.useCallback((e: any) => {
    setChosenIndex(e.target.value);
  }, []);

  return (
    <>
      <h3>Chapter Simulator</h3>

      <select className="bp3-menu" defaultValue={0} onChange={onChangeChapter}>
        {chapters.map((chapter, index) => {
          return (
            <option value={index} key={index}>
              {`Chapter ${index}: ${chapter.title}`}
            </option>
          );
        })}
        <option onClick={onCreateButtonClick} value={-1} key={-1}>
          {`Create new chapter`}
        </option>
      </select>
      <br />
      <StorySimulatorChapterEditor
        chapterDetail={chapters[chosenIndex]}
        allCheckpointFilenames={[]}
      />
    </>
  );
}
