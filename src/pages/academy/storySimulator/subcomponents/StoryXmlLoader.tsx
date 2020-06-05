import 'ace-builds/webpack-resolver';
import * as React from 'react';

import { fetchStories } from '../../../../features/storySimulator/StorySimulatorServices';
import { StoryDetail } from '../../../../features/storySimulator/StorySimulatorTypes';
import StoryItems from './StoryItems';

function StoryXmlLoader() {
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

  return (
    <div className="Vertical AlignCenter">
      <h3>Story XML Loader</h3>
      <input multiple={true} type="file" onChange={onChange} style={{ width: '250px' }} />

      <h4>Uploaded Files</h4>
      {storyListLoaded && <StoryItems key={'upload'} storyList={storyListLoaded} />}

      <h4>S3 Bucket Files</h4>
      {storyListBucket && <StoryItems key={'S3'} storyList={storyListBucket} />}
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
