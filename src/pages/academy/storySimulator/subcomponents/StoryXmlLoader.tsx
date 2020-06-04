import 'ace-builds/webpack-resolver';
import * as React from 'react';

import { s3Folder } from '../features/StorySimulatorConstants';
import { fetchStories } from '../features/StorySimulatorServices';
import StoryItems from './StoryItems';

type OwnProps = {
  setIncludedStoryIds: any;
};

function StoryXmlLoader({ setIncludedStoryIds }: OwnProps) {
  const [storyListLoaded, setStoryListLoaded] = React.useState<string[]>([]);
  const [storyListBucket, setStoryListBucket] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      const stories = await fetchStories();
      const storyIds = Object.values(stories)
        .map(story => story.Key)
        .map(storyId => storyId.slice(s3Folder.length))
        .filter(storyId => !!storyId);
      setStoryListBucket(storyIds);
    })();
  }, []);

  function onChange(e: { target: any }) {
    const files = Object.values(e.target.files);
    files.map(loadFileLocally);
    setStoryListLoaded(files.map((file: File) => file.name));
  }

  function includeStory(storyId: string) {
    console.log(storyId);
    setIncludedStoryIds((x: Set<string>) => x.add(storyId));
  }

  return (
    <div className="Vertical AlignCenter">
      <h3>Story XML Loader</h3>
      <input multiple={true} type="file" onChange={onChange} style={{ width: '250px' }} />

      <h4>Uploaded Files</h4>
      {storyListLoaded && <StoryItems storyList={storyListLoaded} includeStory={includeStory} />}

      <h4>S3 Bucket Files</h4>
      {storyListBucket && <StoryItems storyList={storyListBucket} includeStory={includeStory} />}
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

export function strToXml(str: string) {
  const parser = new DOMParser();
  return parser.parseFromString(str.toString(), 'text/xml');
}

export default StoryXmlLoader;
