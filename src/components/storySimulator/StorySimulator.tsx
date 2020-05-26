import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import JsonUpload from './subcomponents/JsonUpload';
import StoryXmlUpload from './subcomponents/StoryXmlUpload';

function StorySimulator() {
  const handleTest = React.useCallback(() => {
    window.open('/academy/game');
  }, []);

  return (
    <div className="ContentDisplay row center-xs">
      <div className={`${'col-xs-10'} contentdisplay-content-parent`}>
        <div className="WhiteBackground VerticalStack">
          <h2>Story Simulator</h2>
          <div className="Horizontal">
            <StoryXmlUpload />
            <JsonUpload />
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
