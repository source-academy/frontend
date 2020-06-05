import 'ace-builds/webpack-resolver';
import * as React from 'react';

import { fetchStories } from '../features/StorySimulatorServices';
import { StoryDetail } from '../features/StorySimulatorTypes';
import StoryItems from './StoryItems';

type OwnProps = {
  setIncludedStoryIds: any;
};

function StoryXmlLoader({ setIncludedStoryIds }: OwnProps) {
  const [storyListLoaded, setStoryListLoaded] = React.useState<StoryDetail[]>([]);
  const [storyListBucket, setStoryListBucket] = React.useState<StoryDetail[]>([]);

  React.useEffect(() => {
    (async () => {
      const stories = await fetchStories();
      setStoryListBucket(stories);
    })();
  }, []);

  function onChange(e: { target: any }) {
    const files = Object.values(e.target.files);
    files.map(loadFileLocally);
    setStoryListLoaded(files.map(createStoryDetailFromFile));
  }

  function includeStory(storyId: string) {
    setIncludedStoryIds((x: Set<string>) => x.add(storyId));
  }

  return (
    <div className="Vertical AlignCenter">
      <h3>Story XML Loader</h3>
      <input multiple={true} type="file" onChange={onChange} style={{ width: '250px' }} />

      <h4>Uploaded Files</h4>
      {storyListLoaded && (
        <StoryItems key={'upload'} storyList={storyListLoaded} includeStory={includeStory} />
      )}

      <h4>S3 Bucket Files</h4>
      {storyListBucket && (
        <StoryItems key={'S3'} storyList={storyListBucket} includeStory={includeStory} />
      )}
    </div>
  );
}

function loadFileLocally(xmlFile: File) {
  const reader = new FileReader();
  reader.readAsText(xmlFile);
  reader.onloadend = _ => {
    if (!reader.result) {
      return;
    }
    sessionStorage.setItem(`storyXml${xmlFile.name}`, reader.result.toString());
  };
}

function createStoryDetailFromFile(filename: string) {
  return {
    filename,
    openAt: '',
    closeAt: ''
  };
}

export function strToXml(str: string) {
  const parser = new DOMParser();
  return parser.parseFromString(str.toString(), 'text/xml');
}

export default StoryXmlLoader;
