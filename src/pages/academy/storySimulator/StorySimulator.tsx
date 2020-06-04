import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import chooseStory from '../game/backend/chooseStory';
import { setStoryId } from './features/StorySimulatorServices';
import JsonUpload from './subcomponents/JsonUpload';
import StoryXmlLoader from './subcomponents/StoryXmlLoader';

function StorySimulator() {
  const [includedStoryIds, setIncludedStoryIds] = React.useState(new Set([]));
  const handleTest = React.useCallback(() => {
    window.open('/academy/game');
  }, []);

  const storyId: string = chooseStory(includedStoryIds);
  setStoryId(storyId);

  return (
    <div className="ContentDisplay row center-xs ">
      <div className="col-xs-10 contentdisplay-content-parent">
        <div className="WhiteBackground VerticalStack">
          <h2>Story Simulator</h2>

          <div className="Horizontal">
            <div className="Column">
              <StoryXmlLoader setIncludedStoryIds={setIncludedStoryIds} />
            </div>
            <div className="Column">
              <JsonUpload />
            </div>
          </div>

          <div>
            <h3>XML to be loaded</h3>
            {storyId}
          </div>
          <Button icon={IconNames.MOUNTAIN} onClick={handleTest}>
            <div className="ag-grid-button-text hidden-xs">Play Story</div>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StorySimulator;
