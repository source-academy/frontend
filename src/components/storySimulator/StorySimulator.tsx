import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import JsonUpload from './subcomponents/JsonUpload';
import StoryXmlUpload from './subcomponents/StoryXmlUpload';
// import { fetchGameData } from '../academy/game/backend/gameState';

function StorySimulator() {
  const handleTest = React.useCallback(() => {
    window.open('/academy/game');
  }, []);

  // const storyId: string = fetchGameData(userStory, gameState, missions);
  const storyId = 'mission-1';

  return (
    <div className="ContentDisplay row center-xs ">
      <div className="col-xs-10 contentdisplay-content-parent">
        <div className="WhiteBackground VerticalStack">
          <h2>Story Simulator</h2>

          <div className="Horizontal">
            <div className="Column">
              <StoryXmlUpload />
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
