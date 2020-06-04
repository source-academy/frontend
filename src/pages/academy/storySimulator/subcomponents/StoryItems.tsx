import * as React from 'react';

type OwnProps = {
  storyList: string[];
  includeStory: (storyId: string) => void;
};

function StoryItems({ storyList, includeStory }: OwnProps) {
  if (!storyList.length) {
    return <div className="VerticalStack StoryItems">No Stories Loaded</div>;
  }

  const checkStory = (storyId: string) => () => {
    includeStory(storyId);
  };

  return (
    <>
      <div>
        <input type="checkbox" /> Select All Files
      </div>
      <div className="VerticalStack StoryItems">
        {storyList.map(storyId => (
          <div key={storyId}>
            <input type="checkbox" onChange={checkStory(storyId)} /> {storyId}
          </div>
        ))}
      </div>
    </>
  );
}

export default StoryItems;
