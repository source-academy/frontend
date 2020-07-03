import * as React from 'react';
import JsonUpload from './JsonUpload';

function StorySimulator() {
  return (
    <div className="WhiteBackground">
      <h3>Story Simulator</h3>

      <div className="Horizontal">
        <JsonUpload />
      </div>
    </div>
  );
}

export default StorySimulator;
