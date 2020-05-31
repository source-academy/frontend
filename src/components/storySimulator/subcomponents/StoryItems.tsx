import * as React from 'react';

type OwnProps = {
  storyList: string[];
};

function StoryItems({ storyList }: OwnProps) {
  if (!storyList.length) {
    return <div className="VerticalStack StoryItems">No Stories Loaded</div>;
  }

  return (
    <>
      <div>
        <input type="checkbox" /> Select All Files
      </div>
      <div className="VerticalStack StoryItems">
        {storyList.map((storyId, index) => (
          <div key={storyId}>
            <input type="checkbox" /> {storyId}
          </div>
        ))}
      </div>
    </>
  );
}

export default StoryItems;
