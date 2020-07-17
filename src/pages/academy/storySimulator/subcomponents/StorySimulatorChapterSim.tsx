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
  const [chosenIndex, setChosenIndex] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      setChapters(await fetchChapters(accessToken));
    })();
  }, [accessToken]);

  const onCreateButtonClick = React.useCallback(async () => {
    alert(await createChapterRequest(accessToken));
  }, [accessToken]);

  const onChange = React.useCallback((e: any) => {
    setChosenIndex(e.target.value);
  }, []);

  return (
    <>
      <h3>Chapter Simulator</h3>

      <select className="bp3-menu" onChange={onChange}>
        {chapters.map((chapter, index) => {
          return (
            <option value={index} key={index}>
              {`Chapter ${index}: ${chapter.title}`}
            </option>
          );
        })}
        <option onClick={onCreateButtonClick} value={'create'} key={'create'}>
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
